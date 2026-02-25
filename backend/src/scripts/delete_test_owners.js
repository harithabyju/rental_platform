const db = require('../config/db');

async function cleanTestData() {
    const emailsToDelete = [
        'hennamalu369@gmail.com',
        'hennashygy2005@gmail.com',
        'retest_1736184504410@example.com', // Adjusted based on common pattern if exact mismatch
        'test_1736184504115@example.com'
    ];

    // I will use the IDs I found specifically to be sure
    const idsToDelete = [8, 7, 6, 5];

    try {
        await db.query('BEGIN');

        console.log('Finding shops for users:', idsToDelete);
        const shopsRes = await db.query('SELECT id FROM shops WHERE owner_id = ANY($1)', [idsToDelete]);
        const shopIds = shopsRes.rows.map(r => r.id);

        if (shopIds.length > 0) {
            console.log('Deleting shop items for shops:', shopIds);
            await db.query('DELETE FROM shop_items WHERE shop_id = ANY($1)', [shopIds]);

            console.log('Deleting rentals for shops:', shopIds);
            await db.query('DELETE FROM rentals WHERE shop_id = ANY($1)', [shopIds]);

            console.log('Deleting shops:', shopIds);
            await db.query('DELETE FROM shops WHERE id = ANY($1)', [shopIds]);
        }

        console.log('Deleting users:', idsToDelete);
        await db.query('DELETE FROM users WHERE id = ANY($1)', [idsToDelete]);

        await db.query('COMMIT');
        console.log('Successfully cleaned up test data.');
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error during cleanup:', err);
    } finally {
        process.exit(0);
    }
}

cleanTestData();
