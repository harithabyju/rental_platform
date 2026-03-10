const db = require('./src/config/db');

async function checkData() {
    try {
        // Check items
        const items = await db.query('SELECT id, name, image_url, avg_rating, total_reviews FROM items LIMIT 10');
        console.log('=== ITEMS ===');
        console.log(JSON.stringify(items.rows, null, 2));

        // Check shop_items
        const shopItems = await db.query('SELECT si.id, si.item_id, si.shop_id, si.quantity_available, si.is_available FROM shop_items si LIMIT 10');
        console.log('\n=== SHOP ITEMS ===');
        console.log(JSON.stringify(shopItems.rows, null, 2));

        // Check bookings
        const bookings = await db.query('SELECT booking_id, item_id, user_id, status, start_date, end_date FROM bookings ORDER BY created_at DESC LIMIT 10');
        console.log('\n=== BOOKINGS ===');
        console.log(JSON.stringify(bookings.rows, null, 2));

        // Check if reviews table exists
        const reviewsExist = await db.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='reviews')");
        console.log('\n=== REVIEWS TABLE EXISTS ===', reviewsExist.rows[0].exists);

        // Check uploads folder
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            console.log('\n=== UPLOADS ===', files);
        } else {
            console.log('\n=== UPLOADS DIR MISSING ===');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

checkData();
