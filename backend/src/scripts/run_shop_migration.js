require('dotenv').config();
const db = require('../config/db');

async function getTableColumns(tableName) {
    const res = await db.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
        [tableName]
    );
    return res.rows.map(r => r.column_name);
}

async function tableExists(tableName) {
    const res = await db.query(
        `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = $1`,
        [tableName]
    );
    return parseInt(res.rows[0].count) > 0;
}

async function runMigration() {
    console.log('\n🔍 Inspecting actual DB schema...\n');

    const shopsExists = await tableExists('shops');
    const itemsExists = await tableExists('items');
    const categoriesExists = await tableExists('categories');

    if (!shopsExists) {
        console.log('⚠️  shops table does not exist — creating it...');
        await db.query(`
            CREATE TABLE shops (
                shop_id SERIAL PRIMARY KEY,
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                shop_name VARCHAR(255) NOT NULL,
                description TEXT,
                location TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ shops table created');
    } else {
        const shopsCols = await getTableColumns('shops');
        console.log('shops columns:', shopsCols.join(', '));

        // The shops table might use 'id' or 'shop_id'. We adapt accordingly.
        // If the table uses 'id', we rename it and add missing columns.
        if (shopsCols.includes('id') && !shopsCols.includes('shop_id')) {
            console.log('🔧 Renaming shops.id → shop_id...');
            await db.query(`ALTER TABLE shops RENAME COLUMN id TO shop_id`);
            console.log('✅ Renamed shops.id to shop_id');
        }
        if (!shopsCols.includes('shop_name') && shopsCols.includes('name')) {
            console.log('🔧 Renaming shops.name → shop_name...');
            await db.query(`ALTER TABLE shops RENAME COLUMN name TO shop_name`);
            console.log('✅ Renamed shops.name to shop_name');
        }
        if (!shopsCols.includes('shop_name') && !shopsCols.includes('name')) {
            await db.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255)`);
            console.log('✅ Added shop_name column');
        }
        if (!shopsCols.includes('status') && !shopsCols.includes('is_active')) {
            await db.query(`ALTER TABLE shops ADD COLUMN status VARCHAR(50) DEFAULT 'pending'`);
            console.log('✅ Added status column to shops');
        } else if (shopsCols.includes('is_active') && !shopsCols.includes('status')) {
            await db.query(`ALTER TABLE shops ADD COLUMN status VARCHAR(50) DEFAULT 'pending'`);
            console.log('✅ Added status column alongside is_active');
        }
        if (!shopsCols.includes('location')) {
            await db.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS location TEXT`);
            console.log('✅ Added location column to shops');
        }
        if (!shopsCols.includes('owner_id')) {
            await db.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id)`);
            console.log('✅ Added owner_id column to shops');
        }
        if (!shopsCols.includes('created_at')) {
            await db.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        }
        if (!shopsCols.includes('updated_at')) {
            await db.query(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        }
    }

    // --- categories: ensure id column is correct
    if (categoriesExists) {
        const catCols = await getTableColumns('categories');
        console.log('\ncategories columns:', catCols.join(', '));
        // category.repository.js uses 'id' — which matches schema_full.json ✓
    }

    // --- items: fix if needed
    if (!itemsExists) {
        console.log('\n⚠️  items table does not exist — creating it...');
        await db.query(`
            CREATE TABLE items (
                item_id SERIAL PRIMARY KEY,
                shop_id INTEGER REFERENCES shops(shop_id) ON DELETE CASCADE,
                category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
                item_name VARCHAR(255) NOT NULL,
                description TEXT,
                price_per_day DECIMAL(10,2),
                image_url TEXT,
                status VARCHAR(50) DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ items table created');
    } else {
        const itemsCols = await getTableColumns('items');
        console.log('\nitems columns:', itemsCols.join(', '));

        if (itemsCols.includes('id') && !itemsCols.includes('item_id')) {
            await db.query(`ALTER TABLE items RENAME COLUMN id TO item_id`);
            console.log('✅ Renamed items.id to item_id');
        }
        if (itemsCols.includes('name') && !itemsCols.includes('item_name')) {
            await db.query(`ALTER TABLE items RENAME COLUMN name TO item_name`);
            console.log('✅ Renamed items.name to item_name');
        }
        if (!itemsCols.includes('price_per_day') && itemsCols.includes('base_price_inr')) {
            await db.query(`ALTER TABLE items ADD COLUMN price_per_day DECIMAL(10,2)`);
            console.log('✅ Added price_per_day (base_price_inr still exists)');
        }
        if (!itemsCols.includes('price_per_day') && !itemsCols.includes('base_price_inr')) {
            await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS price_per_day DECIMAL(10,2)`);
            console.log('✅ Added price_per_day column');
        }
        if (!itemsCols.includes('shop_id')) {
            await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS shop_id INTEGER`);
        }
        if (!itemsCols.includes('status')) {
            await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'available'`);
            console.log('✅ Added status column to items');
        }
        await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT`);
        console.log('✅ Ensured image_url column exists on items');
        if (!itemsCols.includes('updated_at')) {
            await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        }
    }

    // --- Create shop_permitted_categories now using confirmed shop_id PK
    console.log('\n🔧 Creating shop_permitted_categories table...');
    await db.query(`
        CREATE TABLE IF NOT EXISTS shop_permitted_categories (
            shop_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            PRIMARY KEY (shop_id, category_id)
        )
    `);
    // Add FK to shops separately (to avoid failure if shops.shop_id wasn't ready)
    await db.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'shop_permitted_categories_shop_id_fkey'
            ) THEN
                ALTER TABLE shop_permitted_categories
                ADD CONSTRAINT shop_permitted_categories_shop_id_fkey
                FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE;
            END IF;
        END
        $$;
    `);
    console.log('✅ shop_permitted_categories table ready');

    console.log('\n✅ All migrations completed successfully!\n');
    process.exit(0);
}

runMigration().catch(err => {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
});
