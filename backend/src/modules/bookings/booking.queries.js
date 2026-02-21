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
        s.city as shop_city
    FROM bookings b
    JOIN items i ON b.item_id = i.id
    LEFT JOIN shops s ON b.shop_id = s.id
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

// Check overlap
// Intervals A and B overlap if (StartA <= EndB) and (EndA >= StartB)
exports.checkOverlap = (excludeId) => {
    let query = `
        SELECT booking_id FROM bookings 
        WHERE item_id = $1 
        AND status IN ('confirmed')
        AND (start_date <= $3 AND end_date >= $2)
    `;
    if (excludeId) {
        query += ` AND booking_id != $4`;
    }
    return query;
};
