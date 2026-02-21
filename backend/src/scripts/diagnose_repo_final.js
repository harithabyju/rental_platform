const adminDashboardRepository = require('../modules/admin/dashboard/adminDashboard.repository');

async function testRepo() {
    const methods = [
        'getDashboardStats',
        'getBookingsByCategory',
        'getRevenueTrend',
        'getCategoryDistribution',
        'getTopPerformingShops'
    ];

    console.log('=== Individual Repository Query Test ===');

    for (const method of methods) {
        try {
            console.log(`\nTesting ${method}...`);
            const data = await adminDashboardRepository[method]();
            console.log(`[OK] ${method} returned ${Array.isArray(data) ? data.length + ' rows' : 'data object'}`);
        } catch (err) {
            console.log(`[FAIL] ${method}: ${err.message}`);
            console.error(err.stack);
        }
    }

    process.exit();
}

testRepo();
