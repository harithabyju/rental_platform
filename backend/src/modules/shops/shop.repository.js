const db = require('../../config/db');

// Get all shops with owner info (for admin)
const getAllShops = async (status) => {
    let query = `
        SELECT 
            s.*,
            s.id AS shop_id,
            s.name AS shop_name,
            u.fullname AS owner_name,
            u.email AS owner_email,
            COALESCE((SELECT SUM(total_amount) FROM bookings WHERE shop_id = s.id AND status != 'cancelled'), 0) AS total_revenue
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
    return result.rows;
};

const findShopByOwnerId = async (ownerId) => {
    const result = await db.query(
        `SELECT s.*, s.id as shop_id, s.name as shop_name, u.fullname AS owner_name, u.email AS owner_email
         FROM shops s
         JOIN users u ON s.owner_id = u.id
         WHERE s.owner_id = $1`,
        [ownerId]
    );
    return result.rows[0] || null;
};

const findShopById = async (shopId) => {
    const query = 'SELECT *, id as shop_id, name as shop_name FROM shops WHERE id = $1';
    const result = await db.query(query, [shopId]);
    return result.rows[0];
};

const createShop = async (ownerId, shopData) => {
    const {
        name, description, address, city, state,
        pincode, latitude, longitude, phone, email,
        status, govt_id_url, shop_license_url,
        bank_account_name, bank_account_number, bank_ifsc, bank_name,
        working_hours, location_restrictions
    } = shopData;

    const query = `
        INSERT INTO shops (
            owner_id, name, description, address, city, state, 
            pincode, latitude, longitude, phone, email, status,
            govt_id_url, shop_license_url,
            bank_account_name, bank_account_number, bank_ifsc, bank_name,
            working_hours, location_restrictions,
            created_at, updated_at
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17, $18,
            $19, $20,
            NOW(), NOW()
        )
        RETURNING *, id as shop_id;
    `;
    const values = [
        ownerId, name, description, address, city, state,
        pincode, latitude, longitude, phone, email, status || 'incomplete',
        govt_id_url, shop_license_url,
        bank_account_name, bank_account_number, bank_ifsc, bank_name,
        working_hours ? JSON.stringify(working_hours) : null,
        location_restrictions ? JSON.stringify(location_restrictions) : null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
};

const updateShopStatus = async (shopId, status) => {
    const result = await db.query(
        `UPDATE shops SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *, id as shop_id`,
        [status, shopId]
    );
    return result.rows[0];
};

const updateShop = async (shopId, shopData) => {
    const {
        name, description, address, city, state,
        pincode, latitude, longitude, phone, email,
        govt_id_url, shop_license_url,
        bank_account_name, bank_account_number, bank_ifsc, bank_name,
        working_hours, location_restrictions,
        delivery_enabled
    } = shopData;

    const query = `
        UPDATE shops SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            address = COALESCE($3, address),
            city = COALESCE($4, city),
            state = COALESCE($5, state),
            pincode = COALESCE($6, pincode),
            latitude = COALESCE($7, latitude),
            longitude = COALESCE($8, longitude),
            phone = COALESCE($9, phone),
            email = COALESCE($10, email),
            govt_id_url = COALESCE($11, govt_id_url),
            shop_license_url = COALESCE($12, shop_license_url),
            bank_account_name = COALESCE($13, bank_account_name),
            bank_account_number = COALESCE($14, bank_account_number),
            bank_ifsc = COALESCE($15, bank_ifsc),
            bank_name = COALESCE($16, bank_name),
            working_hours = COALESCE($17, working_hours),
            location_restrictions = COALESCE($18, location_restrictions),
            delivery_enabled = COALESCE($19, delivery_enabled),
            updated_at = NOW()
        WHERE id = $20
        RETURNING *, id as shop_id;
    `;
    const values = [
        name, description, address, city, state,
        pincode, latitude, longitude, phone, email,
        govt_id_url, shop_license_url,
        bank_account_name, bank_account_number, bank_ifsc, bank_name,
        working_hours ? JSON.stringify(working_hours) : null,
        location_restrictions ? JSON.stringify(location_restrictions) : null,
        delivery_enabled,
        shopId
    ];
    const result = await db.query(query, values);
    return result.rows[0];
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
    findShopById,
    createShop,
    updateShop,
    updateShopStatus,
    setPermittedCategories,
    getPermittedCategories,
    // Aliases for compatibility with other logic
    findById: findShopById,
    create: createShop,
    update: updateShop,
    findByOwnerId: findShopByOwnerId
};
