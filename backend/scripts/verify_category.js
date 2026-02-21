const db = require('../src/config/db');

const verifyCategory = async () => {
    try {
        console.log('Verifying category table...');

        // Check if table exists
        const tableCheck = await db.query(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories')"
        );

        if (!tableCheck.rows[0].exists) {
            console.error('Categories table does not exist!');
            process.exit(1);
        }
        console.log('Categories table exists.');

        // clean up test data if exists
        await db.query("DELETE FROM categories WHERE name = 'Test Category'");

        // 1. Create a category
        console.log('Creating test category...');
        const createResult = await db.query(
            "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
            ['Test Category', 'This is a test category']
        );
        const categoryId = createResult.rows[0].id;
        console.log(`Created category with ID: ${categoryId}`);

        // 2. Read the category
        console.log('Reading category...');
        const readResult = await db.query("SELECT * FROM categories WHERE id = $1", [categoryId]);
        if (readResult.rows.length === 0) {
            console.error('Failed to read category!');
            process.exit(1);
        }
        console.log('Category found:', readResult.rows[0]);

        // 3. Delete the category
        console.log('Deleting category...');
        await db.query("DELETE FROM categories WHERE id = $1", [categoryId]);
        console.log('Category deleted.');

        console.log('Verification successful!');
    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        process.exit();
    }
};

verifyCategory();
