const db = require('../config/db');

async function debugItems() {
    try {
        console.log('--- Debugging Items, Shops, and Bookings ---\n');

        const query = `
            SELECT 
                i.id as item_id, 
                i.name as item_name, 
                i.is_active as item_active, 
                si.is_available as shop_item_available, 
                si.quantity_available,
                s.id as shop_id,
                s.name as shop_name, 
                s.status as shop_status, 
                s.is_active as shop_active,
                s.latitude,
                s.longitude,
                c.name as category_name,
                c.slug as category_slug
            FROM items i 
            JOIN shop_items si ON i.id = si.item_id 
            JOIN shops s ON si.shop_id = s.id
            JOIN categories c ON i.category_id = c.id;
        `;

        const result = await db.query(query);

        if (result.rows.length === 0) {
            console.log('No items found in the database.');
        } else {
            console.log('Items in Database:');
            console.table(result.rows.map(row => ({
                'Item ID': row.item_id,
                'Item Name': row.item_name,
                'Item Active': row.item_active,
                'Available': row.shop_item_available,
                'Qty': row.quantity_available,
                'Shop': row.shop_name,
                'Shop Status': row.shop_status,
                'Category': row.category_name,
                'Lat': row.latitude,
                'Lng': row.longitude
            })));

            console.log('\nChecking for overlapping bookings (Today/Tomorrow):');
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

            const bookingsQuery = `
                SELECT b.id, b.item_id, b.shop_id, b.status, b.start_date, b.end_date
                FROM bookings b
                WHERE b.status IN ('confirmed', 'active')
                AND (b.start_date, b.end_date) OVERLAPS ($1, $2);
            `;
            const bookingsRes = await db.query(bookingsQuery, [today, tomorrow]);
            if (bookingsRes.rows.length === 0) {
                console.log('No overlapping bookings found.');
            } else {
                console.table(bookingsRes.rows);
            }
        }

        console.log('\n--- End of Debug ---');
        process.exit(0);
    } catch (error) {
        console.error('Error during debug:', error);
        process.exit(1);
    }
}

debugItems();
