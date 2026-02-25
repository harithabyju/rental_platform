const db = require('../config/db');

async function debugShops() {
    try {
        console.log('--- Debugging Shops and Owners ---\n');

        const query = `
            SELECT 
                s.id as shop_id, 
                s.name as shop_name, 
                s.owner_id, 
                u.fullname as owner_name,
                u.email as owner_email,
                s.status as shop_status, 
                s.is_active as shop_active,
                (SELECT COUNT(*) FROM shop_items si WHERE si.shop_id = s.id) as item_count
            FROM shops s
            JOIN users u ON s.owner_id = u.id;
        `;

        const result = await db.query(query);

        if (result.rows.length === 0) {
            console.log('No shops found in the database.');
        } else {
            console.table(result.rows);
        }

        console.log('\n--- End of Debug ---');
        process.exit(0);
    } catch (error) {
        console.error('Error during debug:', error);
        process.exit(1);
    }
}

debugShops();
