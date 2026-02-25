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
        LIMIT $9 OFFSET $10
    `;

    const latVal = (lat !== undefined && lat !== null && lat !== '') ? parseFloat(lat) : null;
    const lngVal = (lng !== undefined && lng !== null && lng !== '') ? parseFloat(lng) : null;
    const radiusVal = (radius !== undefined && radius !== null && radius !== '') ? parseFloat(radius) : 50;

    const values = [
        latVal,
        lngVal,
        category || null,
        radiusVal,
        start_date || null,
        end_date || null,
        filters.q || null,
        filters.q ? `%${filters.q}%` : null,
        parseInt(limit || 10, 10),
        parseInt(offset || 0, 10)
    ];

    try {
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
            AND s.status = 'approved'
            AND si.is_available = true
            AND ($1::text IS NULL OR $1 = '' OR c.slug = $1 OR c.name = $1 OR c.id::text = $1)
            AND ($7::text IS NULL OR $7 = '' OR i.name ILIKE $8 OR i.description ILIKE $8)
            AND (
                ($2::float IS NULL OR $3::float IS NULL) OR
                (
                    6371 * acos(LEAST(GREATEST(
                        cos(radians($2)) * cos(radians(s.latitude::float)) * 
                        cos(radians(s.longitude::float) - radians($3)) + 
                        sin(radians($2)) * sin(radians(s.latitude::float))
                    , -1), 1))
                ) <= $4
            )
            AND (
                si.quantity_available - (
                    SELECT COALESCE(COUNT(*), 0)
                    FROM bookings b
                    WHERE b.item_id = i.id
                    AND b.status IN ('confirmed', 'active')
                    AND (b.start_date, b.end_date) OVERLAPS ($5, $6)
                )
            ) > 0
        `;
        const countValues = [
            category || null,
            latVal,
            lngVal,
            radiusVal,
            start_date || null,
            end_date || null,
            filters.q || null,
            filters.q ? `%${filters.q}%` : null
        ];
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
    } catch (err) {
        console.error('[Search Service] Query Error:', err.message);
        throw err;
    }
};

module.exports = {
    searchItems
};
