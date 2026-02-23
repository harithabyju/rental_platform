require('dotenv').config();
const db = require('../config/db');

async function getTableColumns(tableName) {
    const res = await db.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
        [tableName]
    );
    return res.rows.map(r => r.column_name);
}

async function revert() {
    console.log('\n🔄 Reverting migration column renames...\n');

    const shopsCols = await getTableColumns('shops');
    console.log('Current shops columns:', shopsCols.join(', '));

    // Revert shops renames
    if (shopsCols.includes('shop_id') && !shopsCols.includes('id')) {
        await db.query(`ALTER TABLE shops RENAME COLUMN shop_id TO id`);
        console.log('✅ Reverted shops.shop_id → id');
    }
    if (shopsCols.includes('shop_name') && !shopsCols.includes('name')) {
        await db.query(`ALTER TABLE shops RENAME COLUMN shop_name TO name`);
        console.log('✅ Reverted shops.shop_name → name');
    }

    const itemsCols = await getTableColumns('items');
    console.log('Current items columns:', itemsCols.join(', '));

    // Revert items renames
    if (itemsCols.includes('item_id') && !itemsCols.includes('id')) {
        await db.query(`ALTER TABLE items RENAME COLUMN item_id TO id`);
        console.log('✅ Reverted items.item_id → id');
    }
    if (itemsCols.includes('item_name') && !itemsCols.includes('name')) {
        await db.query(`ALTER TABLE items RENAME COLUMN item_name TO name`);
        console.log('✅ Reverted items.item_name → name');
    }

    // Fix shop_permitted_categories FK (it referenced shop_id, now shops.id is the PK)
    // Drop and recreate with correct reference
    await db.query(`DROP TABLE IF EXISTS shop_permitted_categories`);
    console.log('🗑️  Dropped old shop_permitted_categories (had wrong FK)');

    // Get actual shops PK name after revert
    const shopsColsAfter = await getTableColumns('shops');
    const shopPK = shopsColsAfter.includes('id') ? 'id' : 'shop_id';
    console.log(`Using shops PK: ${shopPK}`);

    await db.query(`
        CREATE TABLE IF NOT EXISTS shop_permitted_categories (
            shop_id INTEGER NOT NULL REFERENCES shops(${shopPK}) ON DELETE CASCADE,
            category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            PRIMARY KEY (shop_id, category_id)
        )
    `);
    console.log('✅ Recreated shop_permitted_categories with correct shops FK');

    // Ensure shops has status and owner_id columns
    const shopsColsFinal = await getTableColumns('shops');
    if (!shopsColsFinal.includes('status')) {
        // Check if is_active exists; add status anyway
        await db.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'`);
        console.log('✅ Added status column to shops');
    }
    if (!shopsColsFinal.includes('owner_id')) {
        await db.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id)`);
        console.log('✅ Added owner_id column to shops');
    }

    // Ensure items has necessary columns
    const itemsColsFinal = await getTableColumns('items');
    if (!itemsColsFinal.includes('shop_id')) {
        await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS shop_id INTEGER`);
        console.log('✅ Added shop_id column to items');
    }
    if (!itemsColsFinal.includes('price_per_day')) {
        await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS price_per_day DECIMAL(10,2)`);
        console.log('✅ Added price_per_day column to items');
    }
    if (!itemsColsFinal.includes('image_url')) {
        await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT`);
        console.log('✅ Added image_url column to items');
    }
    if (!itemsColsFinal.includes('status')) {
        await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'available'`);
        console.log('✅ Added status column to items');
    }

    // Final state
    const finalShops = await getTableColumns('shops');
    const finalItems = await getTableColumns('items');
    console.log('\n✅ Final shops columns:', finalShops.join(', '));
    console.log('✅ Final items columns:', finalItems.join(', '));
    console.log('\n✅ Revert complete!\n');
    process.exit(0);
}

revert().catch(err => {
    console.error('❌ Revert error:', err.message);
    process.exit(1);
});
