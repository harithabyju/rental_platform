const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function clearDb() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        console.log('Clearing database...');
        // Order matters due to foreign keys. CASCADE handles it but let's be explicit and safe.
        await pool.query('TRUNCATE reviews, payments, rentals, bookings, shop_items, items, shops, users RESTART IDENTITY CASCADE');
        console.log('Database cleared successfully!');

        // Re-seed categories since they are usually static
        console.log('Re-seeding categories...');
        const categoriesSql = `
            INSERT INTO categories (name, description, slug, icon_url) VALUES
            ('Vehicles', 'Cars, bikes, scooters and more', 'vehicles', '🚗'),
            ('Event Items', 'Tents, chairs, tables, decorations', 'event-items', '🎪'),
            ('Costumes', 'Fancy dress, traditional wear, party costumes', 'costumes', '👗'),
            ('Tools & Construction', 'Power tools, hand tools, construction equipment', 'tools-construction', '🔨'),
            ('Electronics', 'Cameras, laptops, projectors, gaming consoles', 'electronics', '💻'),
            ('Furniture', 'Sofas, beds, tables, office furniture', 'furniture', '🛋️'),
            ('Sports & Fitness', 'Bicycles, gym equipment, sports gear', 'sports-fitness', '🚴'),
            ('Party & Celebrations', 'Sound systems, lights, DJ equipment', 'party-celebrations', '🎉')
            ON CONFLICT (slug) DO NOTHING;
        `;
        await pool.query(categoriesSql);
        console.log('Categories seeded.');

    } catch (err) {
        console.error('Error clearing database:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

clearDb();
