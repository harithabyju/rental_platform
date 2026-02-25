const db = require('../config/db');

async function testSearch() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const query = `
        SELECT i.name, s.name as shop_name, si.quantity_available, si.is_available, c.name as category_name
        FROM items i
        JOIN shop_items si ON i.id = si.item_id
        JOIN shops s ON si.shop_id = s.id
        JOIN categories c ON i.category_id = c.id
        WHERE i.is_active = true
        AND s.is_active = true
        AND s.status = 'approved'
        AND si.is_available = true
        AND (
            si.quantity_available - (
                SELECT COALESCE(COUNT(*), 0) FROM bookings b
                WHERE b.item_id = i.id AND b.shop_id = s.id
                AND b.status IN ('confirmed','active')
                AND (b.start_date, b.end_date) OVERLAPS ($1, $2)
            )
        ) > 0
        ORDER BY i.name
    `;

    const res = await db.query(query, [today, tomorrow]);
    console.log('Items visible on Explore page:', res.rows.length);
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}

testSearch().catch(e => { console.error('Error:', e.message); process.exit(1); });
