exports.createBooking = `
    INSERT INTO bookings (item_id, user_id, start_date, end_date, status, total_amount, delivery_method, delivery_fee)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
`;

exports.getUserBookings = `
    SELECT 
        b.*,
        i.name as item_name,
        i.image_url as item_image,
        s.name as shop_name,
        s.city as shop_city,
        do.status as delivery_status,
        do.estimated_delivery_at,
        do.agent_name,
        do.delivery_address as delivery_address_detail
    FROM bookings b
    LEFT JOIN items i ON b.item_id = i.id
    LEFT JOIN shops s ON b.shop_id = s.id
    LEFT JOIN delivery_orders do ON do.booking_id = b.booking_id
    WHERE b.user_id = $1 
    ORDER BY b.created_at DESC;
`;


exports.getBookingById = `
    SELECT * FROM bookings WHERE booking_id = $1;
`;

exports.updateStatus = `
    UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE booking_id = $2 RETURNING *;
`;

exports.updateEndDate = `
    UPDATE bookings SET end_date = $1, updated_at = CURRENT_TIMESTAMP WHERE booking_id = $2 RETURNING *;
`;

// Check overlap count
// Intervals A and B overlap if (StartA <= EndB) and (EndA >= StartB)
exports.checkOverlapCount = (excludeId) => {
    let query = `
        SELECT COUNT(*) as count FROM bookings 
        WHERE item_id = $1 AND shop_id = $2
        AND status IN ('confirmed', 'active', 'pending', 'pending_payment')
        AND (COALESCE(start_date, '1900-01-01'::date)::date, COALESCE(end_date, '2100-01-01'::date)::date) OVERLAPS ($3::date, $4::date)
    `;
    if (excludeId) {
        query += ` AND booking_id != $5`;
    }
    return query;
};
