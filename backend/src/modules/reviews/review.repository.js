const db = require('../../config/db');

const createReview = async (reviewData) => {
    const { user_id, item_id, booking_id, rating, comment } = reviewData;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert review
        const reviewQuery = `
            INSERT INTO reviews (user_id, item_id, booking_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const reviewResult = await client.query(reviewQuery, [user_id, item_id, booking_id, rating, comment]);
        const newReview = reviewResult.rows[0];

        // 2. Update item ratings
        const updateItemQuery = `
            UPDATE items
            SET 
                avg_rating = (SELECT AVG(rating) FROM reviews WHERE item_id = $1),
                total_reviews = (SELECT COUNT(*) FROM reviews WHERE item_id = $1)
            WHERE id = $1;
        `;
        await client.query(updateItemQuery, [item_id]);

        // 3. Update shop ratings (optional but good for consistency)
        // First get shop_id for this item
        const shopIdRes = await client.query('SELECT shop_id FROM shop_items WHERE item_id = $1', [item_id]);
        const shopId = shopIdRes.rows[0]?.shop_id;

        if (shopId) {
            const updateShopQuery = `
                UPDATE shops
                SET 
                    rating = (SELECT AVG(rating) FROM reviews r JOIN items i ON r.item_id = i.id JOIN shop_items si ON i.id = si.item_id WHERE si.shop_id = $1),
                    total_reviews = (SELECT COUNT(*) FROM reviews r JOIN items i ON r.item_id = i.id JOIN shop_items si ON i.id = si.item_id WHERE si.shop_id = $1)
                WHERE id = $1;
            `;
            await client.query(updateShopQuery, [shopId]);
        }

        await client.query('COMMIT');
        return newReview;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getReviewsByItem = async (itemId) => {
    const query = `
        SELECT r.*, u.fullname as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.item_id = $1
        ORDER BY r.created_at DESC;
    `;
    const result = await db.query(query, [itemId]);
    return result.rows;
};

module.exports = {
    createReview,
    getReviewsByItem
};
