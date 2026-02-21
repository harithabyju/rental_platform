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

    // Overlap Check (Simplified - should ideally check specifically for the quantity at the shop)
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
        [itemId, shopId, userId, startDate, endDate, 'pending', totalAmount, deliveryMethod || 'pickup', deliveryFee || 0]
    );
    return result.rows[0];
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

    const result = await db.query(
        'UPDATE bookings SET end_date = $1, total_amount = $2 WHERE booking_id = $3 RETURNING *',
        [newEndDate, newTotalAmount, bookingId]
    );
    return result.rows[0];
};

exports.returnBooking = async (userId, bookingId) => {
    const bookingResult = await db.query(bookingQueries.getBookingById, [bookingId]);
    if (bookingResult.rows.length === 0) throw new Error('Booking not found');
    const booking = bookingResult.rows[0];

    if (booking.user_id !== userId) throw new Error('Unauthorized');

    const result = await db.query(bookingQueries.updateStatus, ['completed', bookingId]);
    return result.rows[0];
};
