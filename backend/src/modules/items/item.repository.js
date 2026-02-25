const db = require('../../config/db');

/**
 * Creates a new item and links it to a shop.
 * Following the items/shop_items separate table schema.
 */
const createItem = async (itemData) => {
    const { shop_id, category_id, item_name, description, price_per_day, image_url, quantity } = itemData;

    // We use a transaction to ensure both records are created
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert into global items table
        const itemQuery = `
            INSERT INTO items (category_id, name, description, image_url, base_price_inr)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, description, image_url;
        `;
        const itemResult = await client.query(itemQuery, [category_id, item_name, description, image_url, price_per_day]);
        const newItem = itemResult.rows[0];

        // 1.5 Fetch category name for redundant storage
        const catRes = await client.query('SELECT name FROM categories WHERE id = $1', [category_id]);
        const categoryName = catRes.rows[0]?.name || 'Unknown';

        // 2. Link to shop_items table
        const shopItemQuery = `
            INSERT INTO shop_items (shop_id, item_id, price_per_day_inr, quantity_available, is_available, category_id, category_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id as shop_item_id, price_per_day_inr as price_per_day;
        `;
        const shopItemResult = await client.query(shopItemQuery, [shop_id, newItem.id, price_per_day, quantity || 1, true, category_id, categoryName]);

        await client.query('COMMIT');

        return {
            ...newItem,
            ...shopItemResult.rows[0],
            item_id: newItem.id // For frontend compatibility
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const updateItem = async (itemId, itemData) => {
    const { item_name, description, price_per_day, status, image_url, category_id, quantity } = itemData;

    // Update global item
    const itemQuery = `
        UPDATE items
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            image_url = COALESCE($3, image_url),
            category_id = COALESCE($4, category_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *;
    `;
    const itemResult = await db.query(itemQuery, [item_name, description, image_url, category_id, itemId]);

    // Fetch category name if category_id was provided or use existing from global item
    let categoryName = undefined;
    if (category_id || itemResult.rows[0]?.category_id) {
        const catId = category_id || itemResult.rows[0].category_id;
        const catRes = await db.query('SELECT name FROM categories WHERE id = $1', [catId]);
        categoryName = catRes.rows[0]?.name;
    }

    // Update shop item (price, availability, quantity, and category)
    const shopItemQuery = `
        UPDATE shop_items
        SET price_per_day_inr = COALESCE($1, price_per_day_inr),
            is_available = COALESCE($2, is_available),
            quantity_available = COALESCE($3, quantity_available),
            category_id = COALESCE($4, category_id),
            category_name = COALESCE($5, category_name),
            updated_at = CURRENT_TIMESTAMP
        WHERE item_id = $6
        RETURNING *;
    `;
    // Map 'available' status to boolean is_available if needed
    const isAvailable = status === 'available' ? true : (status === 'unavailable' ? false : undefined);
    const result = await db.query(shopItemQuery, [price_per_day, isAvailable, quantity, category_id, categoryName, itemId]);

    const r = result.rows[0];
    return r ? { ...r, item_id: itemId } : null;
};

const deleteItem = async (itemId) => {
    // Delete from shop_items first (due to FK)
    await db.query('DELETE FROM shop_items WHERE item_id = $1', [itemId]);
    const query = 'DELETE FROM items WHERE id = $1 RETURNING *';
    const result = await db.query(query, [itemId]);
    return result.rows[0];
};

const findItemById = async (itemId) => {
    const query = `
        SELECT i.*, si.price_per_day_inr as price_per_day, si.shop_id, si.is_available, si.quantity_available, si.category_id as shop_item_category_id, si.category_name as shop_item_category_name, s.name as shop_name, c.name as category_name
        FROM items i
        JOIN shop_items si ON i.id = si.item_id
        JOIN shops s ON si.shop_id = s.id
        LEFT JOIN categories c ON si.category_id = c.id
        WHERE i.id = $1
    `;
    const result = await db.query(query, [itemId]);
    return result.rows[0];
};

const findItemsByShopId = async (shopId) => {
    const query = `
        SELECT i.*, i.id as item_id, i.name as item_name, si.price_per_day_inr as price_per_day, si.is_available, si.quantity_available, si.category_id as shop_item_category_id, si.category_name as shop_item_category_name, c.name as category_name
        FROM items i
        JOIN shop_items si ON i.id = si.item_id
        LEFT JOIN categories c ON si.category_id = c.id
        WHERE si.shop_id = $1
        ORDER BY i.created_at DESC
    `;
    const result = await db.query(query, [shopId]);
    return result.rows;
};

const findAllItems = async (filters) => {
    const query = `
        SELECT i.*, i.id as item_id, i.name as item_name, si.price_per_day_inr as price_per_day, s.name as shop_name, si.category_id as shop_item_category_id, si.category_name as shop_item_category_name, c.name as category_name
        FROM items i
        JOIN shop_items si ON i.id = si.item_id
        JOIN shops s ON si.shop_id = s.id
        LEFT JOIN categories c ON si.category_id = c.id
        WHERE i.is_active = true AND si.is_available = true AND s.status = 'approved'
        ORDER BY i.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

module.exports = {
    findAllItems,
    findItemsByShopId,
    findItemById,
    createItem,
    updateItem,
    deleteItem,
};
