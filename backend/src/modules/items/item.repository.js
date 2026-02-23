const db = require('../../config/db');

// All items from APPROVED shops only (for customers)
const findAllItems = async () => {
    const result = await db.query(`
        SELECT 
            i.id AS item_id,
            i.id,
            i.name AS item_name,
            i.description,
            i.price_per_day,
            i.image_url,
            i.status,
            i.shop_id,
            i.category_id,
            c.name AS category_name,
            s.name AS shop_name
        FROM items i
        JOIN shops s ON i.shop_id = s.id AND s.status = 'approved'
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.status = 'available' OR i.status IS NULL
        ORDER BY i.id DESC
    `);
    return result.rows;
};

const findItemsByShopId = async (shopId) => {
    const result = await db.query(`
        SELECT 
            i.id AS item_id,
            i.id,
            i.name AS item_name,
            i.description,
            i.price_per_day,
            i.image_url,
            i.status,
            i.shop_id,
            i.category_id,
            c.name AS category_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.shop_id = $1
        ORDER BY i.id DESC
    `, [shopId]);
    return result.rows;
};

const findItemById = async (itemId) => {
    const result = await db.query(`
        SELECT 
            i.id AS item_id,
            i.id,
            i.name AS item_name,
            i.description,
            i.price_per_day,
            i.image_url,
            i.status,
            i.shop_id,
            i.category_id,
            c.name AS category_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.id = $1
    `, [itemId]);
    return result.rows[0] || null;
};

const createItem = async (itemData) => {
    const { shop_id, category_id, item_name, description, price_per_day, image_url } = itemData;
    const result = await db.query(`
        INSERT INTO items (shop_id, category_id, name, description, price_per_day, image_url, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'available', NOW(), NOW())
        RETURNING *
    `, [shop_id, category_id || null, item_name, description || null, price_per_day, image_url || null]);
    const r = result.rows[0];
    return { ...r, item_id: r.id, item_name: r.name };
};

const updateItem = async (itemId, itemData) => {
    const { item_name, description, price_per_day, category_id, image_url } = itemData;
    // Build dynamic update
    const updates = [];
    const values = [];
    let i = 1;
    if (item_name !== undefined)    { updates.push(`name = $${i++}`);          values.push(item_name); }
    if (description !== undefined)  { updates.push(`description = $${i++}`);   values.push(description); }
    if (price_per_day !== undefined){ updates.push(`price_per_day = $${i++}`); values.push(price_per_day); }
    if (category_id !== undefined)  { updates.push(`category_id = $${i++}`);   values.push(category_id); }
    if (image_url !== undefined)    { updates.push(`image_url = $${i++}`);     values.push(image_url); }
    updates.push(`updated_at = NOW()`);
    values.push(itemId);
    const result = await db.query(
        `UPDATE items SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
        values
    );
    const r = result.rows[0];
    return r ? { ...r, item_id: r.id, item_name: r.name } : null;
};

const deleteItem = async (itemId) => {
    await db.query(`DELETE FROM items WHERE id = $1`, [itemId]);
};

module.exports = {
    findAllItems,
    findItemsByShopId,
    findItemById,
    createItem,
    updateItem,
    deleteItem,
};
