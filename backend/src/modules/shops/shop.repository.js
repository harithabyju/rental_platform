const db = require('../../config/db');

const createShop = async (shopData) => {
    const { owner_id, shop_name, description, location } = shopData;
    const query = `
        INSERT INTO shops (owner_id, shop_name, description, location, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING *;
    `;
    const values = [owner_id, shop_name, description, location];
    const result = await db.query(query, values);
    return result.rows[0];
};

const findShopByOwnerId = async (ownerId) => {
    const query = 'SELECT * FROM shops WHERE owner_id = $1';
    const result = await db.query(query, [ownerId]);
    return result.rows[0];
};

const findShopById = async (shopId) => {
    const query = 'SELECT * FROM shops WHERE shop_id = $1';
    const result = await db.query(query, [shopId]);
    return result.rows[0];
};

const updateShopStatus = async (shopId, status) => {
    const query = `
        UPDATE shops 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE shop_id = $2
        RETURNING *;
    `;
    const result = await db.query(query, [status, shopId]);
    return result.rows[0];
};

const getAllShops = async (status) => {
    let query = 'SELECT * FROM shops';
    const values = [];
    if (status) {
        query += ' WHERE status = $1';
        values.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, values);
    return result.rows;
};

module.exports = {
    createShop,
    findShopByOwnerId,
    findShopById,
    updateShopStatus,
    getAllShops
};
