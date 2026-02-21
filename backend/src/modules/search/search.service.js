const db = require('../../config/db');
const queries = require('./search.query');

const searchItems = async (filters) => {
    const {
        lat,
        lng,
        category,
        radius,
        start_date,
        end_date,
        sort,
        page,
        limit
    } = filters;

    const offset = (page - 1) * limit;

    let orderBy = 'distance ASC';
    if (sort === 'price') orderBy = 'price ASC';
    if (sort === 'rating') orderBy = 'i.avg_rating DESC';

    const query = `
        ${queries.SEARCH_ITEMS}
        ORDER BY ${orderBy}
        LIMIT $7 OFFSET $8
    `;

    const values = [lat, lng, category, radius, start_date, end_date, limit, offset];

    const result = await db.query(query, values);

    // Get total count for pagination
    const countQuery = `
        SELECT COUNT(*) 
        FROM items i
        JOIN shop_items si ON i.id = si.item_id
        JOIN shops s ON si.shop_id = s.id
        JOIN categories c ON i.category_id = c.id
        WHERE i.is_active = true 
        AND s.is_active = true
        AND si.is_available = true
        AND (c.slug = $1 OR c.name = $1)
        AND (
            6371 * acos(
                cos(radians($2)) * cos(radians(s.latitude)) * 
                cos(radians(s.longitude) - radians($3)) + 
                sin(radians($2)) * sin(radians(s.latitude))
            )
        ) <= $4
        AND NOT EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.item_id = i.id
            AND b.status IN ('confirmed', 'active')
            AND (b.start_date, b.end_date) OVERLAPS ($5, $6)
        )
    `;
    const countValues = [category, lat, lng, radius, start_date, end_date];
    const totalCount = await db.query(countQuery, countValues);

    return {
        items: result.rows,
        pagination: {
            total: parseInt(totalCount.rows[0].count),
            page,
            limit,
            pages: Math.ceil(parseInt(totalCount.rows[0].count) / limit)
        }
    };
};

module.exports = {
    searchItems
};
