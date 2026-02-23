const db = require('../../config/db');

// Get all shops with owner info (for admin)
const getAllShops = async (status) => {
    let query = `
        SELECT 
            s.id,
            s.name AS shop_name,
            s.description,
            s.status,
            s.owner_id,
            s.city,
            s.state,
            s.address,
            s.created_at,
            u.fullname AS owner_name,
            u.email AS owner_email
        FROM shops s
        JOIN users u ON s.owner_id = u.id
    `;
    const params = [];
    if (status) {
        query += ` WHERE s.status = $1`;
        params.push(status);
    }
    query += ` ORDER BY s.created_at DESC`;
    const result = await db.query(query, params);
    // Normalize: frontend expects shop_id field
    return result.rows.map(r => ({ ...r, shop_id: r.id }));
};

const findShopByOwnerId = async (ownerId) => {
    const result = await db.query(
        `SELECT s.*, u.fullname AS owner_name, u.email AS owner_email
         FROM shops s
         JOIN users u ON s.owner_id = u.id
         WHERE s.owner_id = $1`,
        [ownerId]
    );
    if (!result.rows[0]) return null;
    const r = result.rows[0];
    return { ...r, shop_id: r.id, shop_name: r.name };
};

const createShop = async (ownerId, shopData) => {
    const { shop_name, description, location } = shopData;
    const result = await db.query(
        `INSERT INTO shops (owner_id, name, description, city, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
         RETURNING *`,
        [ownerId, shop_name, description || null, location || null]
    );
    const r = result.rows[0];
    return { ...r, shop_id: r.id, shop_name: r.name };
};

const updateShopStatus = async (shopId, status) => {
    const result = await db.query(
        `UPDATE shops SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, shopId]
    );
    const r = result.rows[0];
    return r ? { ...r, shop_id: r.id, shop_name: r.name } : null;
};

const setPermittedCategories = async (shopId, categoryIds) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM shop_permitted_categories WHERE shop_id = $1', [shopId]);
        for (const catId of categoryIds) {
            await client.query(
                'INSERT INTO shop_permitted_categories (shop_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [shopId, catId]
            );
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const getPermittedCategories = async (shopId) => {
    const result = await db.query(
        `SELECT c.id, c.name
         FROM categories c
         JOIN shop_permitted_categories spc ON c.id = spc.category_id
         WHERE spc.shop_id = $1`,
        [shopId]
    );
    return result.rows;
};

module.exports = {
    getAllShops,
    findShopByOwnerId,
    createShop,
    updateShopStatus,
    setPermittedCategories,
    getPermittedCategories,
};
