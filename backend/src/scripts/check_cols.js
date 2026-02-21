const db = require('../config/db');

async function checkCols() {
    const tables = ['users', 'bookings', 'shop_items', 'items', 'shops'];
    for (const t of tables) {
        const res = await db.query(
            'SELECT column_name FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position',
            [t]
        );
        console.log(`\n${t.toUpperCase()}:`, res.rows.map(r => r.column_name).join(', '));
    }
    
    // Also test the exact queries that are failing
    try {
        await db.query('SELECT id, fullname, email, role, verified, created_at, blocked, latitude, longitude FROM users WHERE id = $1', [1]);
        console.log('\nusers/me query: OK');
    } catch(e) {
        console.log('\nusers/me query FAILED:', e.message);
    }
    
    try {
        await db.query(`SELECT b.*, i.name as item_name, i.image_url as item_image, s.name as shop_name
            FROM bookings b
            JOIN items i ON b.item_id = i.id
            JOIN shop_items si ON i.id = si.item_id
            JOIN shops s ON si.shop_id = s.id
            WHERE b.user_id = $1 ORDER BY b.created_at DESC`, [1]);
        console.log('bookings query: OK');
    } catch(e) {
        console.log('bookings query FAILED:', e.message);
    }
    
    process.exit(0);
}
checkCols().catch(console.error);
