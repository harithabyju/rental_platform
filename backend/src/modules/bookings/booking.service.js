const db = require('../../config/db');
const bookingQueries = require('./booking.queries');

const OVERLAP_ERROR = 'Dates overlap with an existing booking';

const checkOverlap = async (itemId, startDate, endDate, excludeBookingId = null) => {
    const query = bookingQueries.checkOverlap(excludeBookingId);
    const params = excludeBookingId
        ? [itemId, startDate, endDate, excludeBookingId]
        : [itemId, startDate, endDate];

    const result = await db.query(query, params);
    return result.rows.length > 0;
};

exports.createBooking = async (userId, data) => {
    const { itemId, shopId, startDate, endDate, totalAmount, deliveryMethod, deliveryFee } = data;

    // Overlap Check
    const isOverlapping = await checkOverlap(itemId, startDate, endDate);
    if (isOverlapping) {
        const error = new Error(OVERLAP_ERROR);
        error.statusCode = 400;
        throw error;
    }

    // Create Booking
    const result = await db.query(
        `INSERT INTO bookings (item_id, shop_id, user_id, start_date, end_date, status, total_amount, delivery_method, delivery_fee)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [itemId, shopId, userId, startDate, endDate, 'confirmed', totalAmount, deliveryMethod || 'pickup', deliveryFee || 0]
    );

    const booking = result.rows[0];

    // Record initial payment (Mocking for now as per verifySignature logic)
    await db.query(
        `INSERT INTO payments (booking_id, user_id, amount_inr, status, paid_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [booking.booking_id, userId, totalAmount, 'paid']
    );

    // Dynamic Availability Check (Overlap handled by search query)
    // NOTE: We do NOT decrement quantity_available here because the search query 
    // calculates remaining quantity dynamically. Manual decrement causes errors.

    // Notify Shop Owner and Customer (Async)
    const { sendEmail } = require('../../utils/email');

    // Fetch both user and shop owner details
    const detailsQuery = `
        SELECT 
            u.email as customer_email, u.fullname as customer_name,
            so.email as owner_email, so.fullname as owner_name,
            s.name as shop_name,
            i.name as item_name
        FROM users u
        CROSS JOIN (
            SELECT u2.email, u2.fullname, s.name, s.id
            FROM users u2 
            JOIN shops s ON s.owner_id = u2.id 
            WHERE s.id = $2
        ) so
        JOIN items i ON i.id = $3
        WHERE u.id = $1
    `;

    db.query(detailsQuery, [userId, shopId, itemId])
        .then(res => {
            const data = res.rows[0];
            if (data) {
                // To Shop Owner
                sendEmail(
                    data.owner_email,
                    'New Booking Received',
                    `Hello ${data.owner_name},\n\nYou have received a new booking for your shop "${data.shop_name}".\nItem: ${data.item_name}\nBooking ID: ${booking.booking_id}\nDates: ${startDate} to ${endDate}\nAmount: ₹${totalAmount}\n\nPlease check your dashboard for details.`
                );

                // To Customer
                sendEmail(
                    data.customer_email,
                    'Booking Confirmation',
                    `Hello ${data.customer_name},\n\nYour booking for "${data.item_name}" at "${data.shop_name}" has been confirmed!\nBooking ID: ${booking.booking_id}\nDates: ${startDate} to ${endDate}\nTotal Paid: ₹${totalAmount}\n\nThank you for using our platform!`
                );
            }
        });

    return booking;
};

exports.getUserBookings = async (userId) => {
    const result = await db.query(bookingQueries.getUserBookings, [userId]);
    return result.rows;
};

exports.cancelBooking = async (userId, bookingId) => {
    const bookingResult = await db.query(bookingQueries.getBookingById, [bookingId]);
    if (bookingResult.rows.length === 0) throw new Error('Booking not found');
    const booking = bookingResult.rows[0];

    if (booking.user_id !== userId) throw new Error('Unauthorized');
    if (booking.status === 'cancelled' || booking.status === 'completed') {
        throw new Error('Cannot cancel completed or already cancelled booking');
    }

    // Refund Logic: 
    // If cancelled before start_date: 100% refund
    // If cancelled after start_date: 50% refund on remaining days
    const now = new Date();
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    let refundAmount = booking.total_amount;

    if (now > start) {
        const totalDuration = end - start;
        const usedDuration = now - start;
        const remainingRatio = Math.max(0, (totalDuration - usedDuration) / totalDuration);
        refundAmount = (booking.total_amount * remainingRatio * 0.5).toFixed(2);
    }

    const result = await db.query(bookingQueries.updateStatus, ['cancelled', bookingId]);
    return {
        ...result.rows[0],
        refundAmount,
        message: `Booking cancelled. Refund of ₹${refundAmount} calculated.`
    };
};

exports.extendBooking = async (userId, bookingId, newEndDate) => {
    const bookingResult = await db.query(bookingQueries.getBookingById, [bookingId]);
    if (bookingResult.rows.length === 0) throw new Error('Booking not found');
    const booking = bookingResult.rows[0];

    if (booking.user_id !== userId) throw new Error('Unauthorized');
    if (booking.status !== 'confirmed' && booking.status !== 'active') throw new Error('Cannot extend this booking');

    // Get item price for the CORRECT shop
    const shopItemResult = await db.query(
        'SELECT price_per_day_inr FROM shop_items WHERE item_id = $1 AND shop_id = $2',
        [booking.item_id, booking.shop_id]
    );
    const pricePerDay = shopItemResult.rows[0]?.price_per_day_inr;

    if (!pricePerDay) throw new Error('Could not determine item price at the shop');

    // Overlap Check
    const isOverlapping = await checkOverlap(booking.item_id, booking.start_date, newEndDate, bookingId);
    if (isOverlapping) {
        throw new Error(OVERLAP_ERROR);
    }

    const oldEndDate = new Date(booking.end_date);
    const addedDate = new Date(newEndDate);
    const diffDays = Math.ceil((addedDate - oldEndDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) throw new Error('New end date must be after current end date');

    const additionalAmount = diffDays * pricePerDay;
    const newTotalAmount = parseFloat(booking.total_amount) + additionalAmount;

    // Start Transaction
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update Booking
        const result = await client.query(
            'UPDATE bookings SET end_date = $1, total_amount = $2 WHERE booking_id = $3 RETURNING *',
            [newEndDate, newTotalAmount, bookingId]
        );

        // 2. Record Additional Payment
        await client.query(
            `INSERT INTO payments (booking_id, user_id, amount_inr, status, paid_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [bookingId, userId, additionalAmount, 'paid']
        );

        // 3. Update Rental End Date if it exists
        await client.query(
            'UPDATE rentals SET end_date = $1 WHERE booking_id = $2',
            [newEndDate, bookingId]
        );

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.returnBooking = async (userId, bookingId) => {
    const bookingResult = await db.query(bookingQueries.getBookingById, [bookingId]);
    if (bookingResult.rows.length === 0) throw new Error('Booking not found');
    const booking = bookingResult.rows[0];

    if (booking.user_id !== userId) throw new Error('Unauthorized');

    const result = await db.query(bookingQueries.updateStatus, ['completed', bookingId]);
    return result.rows[0];
};
