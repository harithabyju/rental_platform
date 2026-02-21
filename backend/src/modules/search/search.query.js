const SEARCH_ITEMS = `
    SELECT 
        i.id,
        i.name,
        i.description,
        i.image_url,
        i.avg_rating,
        si.price_per_day_inr as price,
        s.id as shop_id,
        s.name as shop_name,
        s.rating as shop_rating,
        s.latitude::float,
        s.longitude::float,
        (
            6371 * acos(LEAST(GREATEST(
                cos(radians($1)) * cos(radians(s.latitude::float)) *
                cos(radians(s.longitude::float) - radians($2)) +
                sin(radians($1)) * sin(radians(s.latitude::float))
            , -1), 1))
        ) AS distance,
        si.is_available
    FROM items i
    JOIN shop_items si ON i.id = si.item_id
    JOIN shops s ON si.shop_id = s.id
    JOIN categories c ON i.category_id = c.id
    WHERE i.is_active = true
    AND s.is_active = true
    AND si.is_available = true
    AND ($3::text IS NULL OR $3 = '' OR c.slug = $3 OR c.name = $3)
    AND (
        6371 * acos(LEAST(GREATEST(
            cos(radians($1)) * cos(radians(s.latitude::float)) * 
            cos(radians(s.longitude::float) - radians($2)) + 
            sin(radians($1)) * sin(radians(s.latitude::float))
        , -1), 1))
    ) <= $4
    AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.item_id = i.id
        AND b.status IN ('confirmed', 'active')
        AND (b.start_date, b.end_date) OVERLAPS ($5, $6)
    )
`;

module.exports = {
    SEARCH_ITEMS
};
