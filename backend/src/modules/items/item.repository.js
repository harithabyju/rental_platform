const db = require('../../config/db');

const createItem = async (itemData) => {
    const { shop_id, category_id, item_name, description, price_per_day, image_url } = itemData;
    const query = `
        INSERT INTO items (shop_id, category_id, item_name, description, price_per_day, image_url, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'available')
        RETURNING *;
    `;
    const values = [shop_id, category_id, item_name, description, price_per_day, image_url];
    const result = await db.query(query, values);
    return result.rows[0];
};

const updateItem = async (itemId, itemData) => {
    const { item_name, description, price_per_day, status, image_url } = itemData;
    const query = `
        UPDATE items
        SET item_name = COALESCE($1, item_name),
            description = COALESCE($2, description),
            price_per_day = COALESCE($3, price_per_day),
            status = COALESCE($4, status),
            image_url = COALESCE($5, image_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE item_id = $6
        RETURNING *;
    `;
    const values = [item_name, description, price_per_day, status, image_url, itemId];
    const result = await db.query(query, values);
    return result.rows[0];
};

const deleteItem = async (itemId) => {
    const query = 'DELETE FROM items WHERE item_id = $1 RETURNING *';
    const result = await db.query(query, [itemId]);
    return result.rows[0];
};

const findItemById = async (itemId) => {
    const query = 'SELECT * FROM items WHERE item_id = $1';
    const result = await db.query(query, [itemId]);
    return result.rows[0];
};

const findItemsByShopId = async (shopId) => {
    const query = 'SELECT * FROM items WHERE shop_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [shopId]);
    return result.rows;
};

const findAllItems = async (filters) => {
    let query = 'SELECT * FROM items WHERE status = \'available\'';
    const values = [];
    // Add more filters if needed (category, search, etc)
    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, values);
    return result.rows;
};

module.exports = {
    createItem,
    updateItem,
    deleteItem,
    findItemById,
    findItemsByShopId,
    findAllItems
};
