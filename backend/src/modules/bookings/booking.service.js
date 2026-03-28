const db = require('../../config/db');
const bookingQueries = require('./booking.queries');
const shopService = require('../shops/shop.service');
const deliveryService = require('../delivery/delivery.service');

const OVERLAP_ERROR = 'Dates overlap with an existing booking';

const checkOverlap = async (itemId, shopId, startDate, endDate, quantityLimit, excludeBookingId = null) => {
    const query = bookingQueries.checkOverlapCount(excludeBookingId);
    const params = excludeBookingId
        ? [itemId, shopId, startDate, endDate, excludeBookingId]
        : [itemId, shopId, startDate, endDate];

    const result = await db.query(query, params);
    const count = parseInt(result.rows[0].count);
    return count >= quantityLimit;
};

exports.createBooking = async (userId, data) => {
    const { itemId, shopId, startDate, endDate, totalAmount, deliveryMethod, deliveryFee, delivery_address, address, deliveryCity, deliveryLat, deliveryLng } = data;
    const finalAddress = delivery_address || address;

    // 1. Fetch item and associated shop info for Risk Checks
    const itemResult = await db.query('SELECT * FROM shop_items WHERE id = $1 AND shop_id = $2', [itemId, shopId]);
    if (itemResult.rows.length === 0) throw new Error('Item not found in this shop');
    const item = itemResult.rows[0];

    // Scenario 1: Night-Time Rental Restriction
    const isOpen = await shopService.isShopOpen(shopId, startDate);
    if (!isOpen) {
        throw new Error(`Shop is closed at the scheduled pick-up time. Use reasonable working hours.`);
    }

    // Scenario 10: Location-Based Restrictions
    if (item.shop_restrictions && delivery_address) {
        const isRestricted = item.shop_restrictions.some(region =>
            delivery_address.toLowerCase().includes(region.toLowerCase())
        );
        if (isRestricted) {
            throw new Error('This item cannot be delivered to your selected region.');
        }
    }

    // Overlap Check (based on quantity)
    const isOverlapping = await checkOverlap(item.item_id, shopId, startDate, endDate, item.quantity_available);
    if (isOverlapping) {
        const error = new Error(`All units of this item are already in rent for that time period. Please try different dates or pick another shop.`);
        error.statusCode = 400;
        throw error;
    }

    // Check quantity available
    const qtyCheck = await db.query(
        'SELECT quantity_available FROM shop_items WHERE id = $1 AND shop_id = $2',
        [item.id, shopId]
    );
    if (qtyCheck.rows.length === 0) throw new Error('Item not found in this shop');
    if (qtyCheck.rows[0].quantity_available <= 0) throw new Error('Item is out of stock');

    // Use a transaction for booking + quantity decrement
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create Booking
        const result = await client.query(
            `INSERT INTO bookings (item_id, shop_id, user_id, start_date, end_date, status, total_amount, delivery_method, delivery_fee, delivery_address, delivery_city, delivery_lat, delivery_lng)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING *`,
            [item.item_id, shopId, userId, startDate, endDate, 'pending_payment', totalAmount, deliveryMethod || 'pickup', deliveryFee || 0, finalAddress || null, deliveryCity || null, deliveryLat || null, deliveryLng || null]
        );
        const booking = result.rows[0];

        // 2. Note: Payment record will be created after Razorpay verification
        // 3. Increment/Decrement happens at Activation/Return

        await client.query('COMMIT');

        // Auto-create delivery order if delivery method is selected and address is provided
        if ((deliveryMethod === 'delivery') && (finalAddress)) {
            try {
                await deliveryService.createDeliveryOrder(
                    booking.booking_id,
                    finalAddress,
                    deliveryCity || null,
                    deliveryLat || null,
                    deliveryLng || null,
                    deliveryFee || 0,
                    null
                );
            } catch (deliveryErr) {
                console.error('[DELIVERY] Failed to create delivery order:', deliveryErr.message);
                // Non-fatal at this stage
            }
        }

        // Notify Shop Owner and Customer (Async - fire and forget)
        try {
            const { sendEmail } = require('../../utils/email');
            const detailsQuery = `
                SELECT 
                    u.email as customer_email, u.fullname as customer_name,
                    so.email as owner_email, so.fullname as owner_name,
                    so.name as shop_name,
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
                    const emailData = res.rows[0];
                    if (emailData) {
                        sendEmail(emailData.owner_email, 'New Booking Received',
                            `Hello ${emailData.owner_name},\n\nYou have received a new booking for your shop "${emailData.shop_name}".\nItem: ${emailData.item_name}\nBooking ID: ${booking.booking_id}\nDates: ${startDate} to ${endDate}\nAmount: ₹${totalAmount}\n\nPlease check your dashboard to confirm.`
                        );
                        sendEmail(emailData.customer_email, 'Booking Request Sent',
                            `Hello ${emailData.customer_name},\n\nYour booking request for "${emailData.item_name}" at "${emailData.shop_name}" has been sent!\nBooking ID: ${booking.booking_id}\nDates: ${startDate} to ${endDate}\nTotal Paid: ₹${totalAmount}\n\nPlease wait for the vendor to confirm.`
                        );
                    }
                }).catch(() => { }); // Silently ignore email errors
        } catch (e) { /* ignore email errors */ }

        return booking;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.getUserBookings = async (userId) => {
    const result = await db.query(bookingQueries.getUserBookings, [userId]);
    return result.rows;
};

exports.getShopBookings = async (ownerId) => {
    const query = `
        SELECT b.*, i.name as item_name 
        FROM bookings b
        JOIN items i ON b.item_id = i.id
        JOIN shops s ON b.shop_id = s.id
        WHERE s.owner_id = $1
        ORDER BY b.created_at DESC;
    `;
    const result = await db.query(query, [ownerId]);
    return result.rows;
};

exports.confirmBooking = async (ownerId, bookingId) => {
    const result = await db.query(
        `UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
         FROM items, shops 
         WHERE bookings.item_id = items.id AND items.shop_id = shops.id AND shops.owner_id = $1 AND bookings.booking_id = $2
         RETURNING bookings.*`,
        [ownerId, bookingId]
    );

    if (result.rows.length === 0) throw new Error('Booking not found or unauthorized');
    const booking = result.rows[0];

    // Ensure delivery order exists if it's a delivery booking
    if (booking.delivery_method === 'delivery' && booking.delivery_address) {
        try {
            await deliveryService.createDeliveryOrder(
                booking.booking_id,
                booking.delivery_address,
                booking.delivery_city,
                booking.delivery_lat,
                booking.delivery_lng,
                booking.delivery_fee,
                null
            );
        } catch (deliveryErr) {
            console.error('[DELIVERY] Failed to auto-create delivery order on confirmation:', deliveryErr.message);
        }
    }

    return booking;
};

exports.cancelBooking = async (userId, bookingId) => {
    const bookingResult = await db.query(bookingQueries.getBookingById, [bookingId]);
    if (bookingResult.rows.length === 0) throw new Error('Booking not found');
    const booking = bookingResult.rows[0];

    if (booking.user_id !== userId) throw new Error('Unauthorized');
    if (booking.status === 'cancelled' || booking.status === 'completed') {
        throw new Error('Cannot cancel completed or already cancelled booking');
    }

    // Refund Logic
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

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update booking status to cancelled
        const result = await client.query(bookingQueries.updateStatus, ['cancelled', bookingId]);

        // 2. Cancellation completed

        await client.query('COMMIT');

        return {
            ...result.rows[0],
            refundAmount,
            message: `Booking cancelled. Refund of ₹${refundAmount} calculated.`
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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
    // Modified to join shops table so we can check if the user is the shop owner
    const bookingResult = await db.query(`
        SELECT b.*, s.owner_id as shop_owner_id 
        FROM bookings b
        JOIN shops s ON b.shop_id = s.id
        WHERE b.booking_id = $1
    `, [bookingId]);
    
    if (bookingResult.rows.length === 0) throw new Error('Booking not found');
    const booking = bookingResult.rows[0];

    // Authorize: Only the customer who rented it OR the owner of the shop can confirm the return
    if (booking.user_id !== userId && booking.shop_owner_id !== userId) {
        throw new Error('Unauthorized. Only the renter or shop owner can confirm the return.');
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Mark booking as completed
        const result = await client.query(bookingQueries.updateStatus, ['completed', bookingId]);

        // 2. Increment        // No manual replenishment here (using calendar-based logic)

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Activate booking and decrement inventory (Lazy Reservation)
 */
exports.activateBooking = async (bookingId) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get Booking details
        const result = await client.query('SELECT * FROM bookings WHERE booking_id = $1', [bookingId]);
        if (result.rows.length === 0) throw new Error('Booking not found');
        const booking = result.rows[0];

        if (booking.status === 'confirmed' || booking.status === 'active') {
            await client.query('COMMIT');
            return booking; // Already activated
        }

        // 2. Check Inventory via overlap count
        const overlapQuery = bookingQueries.checkOverlapCount(bookingId);
        const overlapRes = await client.query(overlapQuery, [booking.item_id, booking.shop_id, booking.start_date, booking.end_date, bookingId]);
        const currentBookedCount = parseInt(overlapRes.rows[0].count);

        const shopItemRes = await client.query(
            'SELECT quantity_available FROM shop_items WHERE item_id = $1 AND shop_id = $2',
            [booking.item_id, booking.shop_id]
        );
        
        if (shopItemRes.rows.length === 0) {
            throw new Error(`Item configuration not found for shop ${booking.shop_id}`);
        }
        
        const totalQuantity = shopItemRes.rows[0].quantity_available;

        if (currentBookedCount >= totalQuantity) {
            throw new Error('This item is already fully rented for this period.');
        }

        // 3. Send Email Notification to Shop Owner if this booking hits the limit for its period
        if (currentBookedCount + 1 >= totalQuantity) {
            try {
                const ownerRes = await client.query(
                    `SELECT u.email, u.fullname, s.name as shop_name, i.name as item_name
                     FROM shops s
                     JOIN users u ON s.owner_id = u.id
                     JOIN items i ON i.id = $1
                     WHERE s.id = $2`,
                    [booking.item_id, booking.shop_id]
                );

                if (ownerRes.rows.length > 0) {
                    const { email, fullname, shop_name, item_name } = ownerRes.rows[0];
                    const subject = `Urgent: Item Capacity Reached - ${item_name}`;
                    const text = `Hello ${fullname},\n\nYour item "${item_name}" in shop "${shop_name}" has reached its maximum rental capacity for the period starting ${new Date(booking.start_date).toLocaleDateString()}.\n\nIt won't be visible on the explore page for these specific dates unless you add more quantity.\n\nregards from antigravity`;
                    
                    const { sendEmail } = require('../../utils/email');
                    sendEmail(email, subject, text);
                }
            } catch (emailErr) {
                console.error('Failed to send capacity email:', emailErr);
            }
        }

        // 4. Update Booking Status
        const updateRes = await client.query(
            `UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE booking_id = $1 RETURNING *`,
            [bookingId]
        );
        const finalBooking = updateRes.rows[0];

        // 5. Ensure delivery order exists if it's a delivery booking
        if (finalBooking.delivery_method === 'delivery' && finalBooking.delivery_address) {
            try {
                await deliveryService.createDeliveryOrder(
                    finalBooking.booking_id,
                    finalBooking.delivery_address,
                    finalBooking.delivery_city,
                    finalBooking.delivery_lat,
                    finalBooking.delivery_lng,
                    finalBooking.delivery_fee,
                    null
                );
            } catch (deliveryErr) {
                console.error('[DELIVERY] Failed to auto-create delivery order on activation:', deliveryErr.message);
            }
        }

        await client.query('COMMIT');
        return finalBooking;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.deleteBooking = async (userId, bookingId) => {
    // Only allow deletion of own bookings that are still pending payment
    const result = await db.query(
        'DELETE FROM bookings WHERE booking_id = $1 AND user_id = $2 AND status = \'pending_payment\' RETURNING *',
        [bookingId, userId]
    );
    
    if (result.rows.length === 0) {
        throw new Error('Booking not found or cannot be deleted (already paid or not yours)');
    }
    return result.rows[0];
};
