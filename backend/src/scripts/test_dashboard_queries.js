const db = require('../config/db');
const query = require('../modules/dashboard/dashboard.query');

// Use a real user ID from the DB
const TEST_USER_ID = 1;

async function runTest(name, fn) {
    try {
        const result = await fn();
        console.log(`[OK] ${name}`);
        return result;
    } catch (err) {
        console.error(`[FAIL] ${name}: ${err.message}`);
    }
}

async function main() {
    // Get a real user ID first
    const userRes = await db.query('SELECT id FROM users LIMIT 1');
    const userId = userRes.rows[0]?.id || TEST_USER_ID;
    console.log(`Using user ID: ${userId}`);

    await runTest('getDashboardSummary', () => query.getDashboardSummary(userId));
    await runTest('getAllCategories', () => query.getAllCategories());
    await runTest('getActiveRentalsByUser', () => query.getActiveRentalsByUser(userId));
    await runTest('getUserProfileStats', () => query.getUserProfileStats(userId));
    await runTest('getPaymentsByUser', () => query.getPaymentsByUser(userId, 10, 0));
    
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
