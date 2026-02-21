const adminDashboardRepository = require('../modules/admin/dashboard/adminDashboard.repository');

async function testRepo() {
    try {
        console.log('--- Testing Repository Queries ---');
        
        console.log('Testing getDashboardStats...');
        const stats = await adminDashboardRepository.getDashboardStats();
        console.log('Stats:', stats);

        console.log('\nTesting getBookingsByCategory...');
        const bookings = await adminDashboardRepository.getBookingsByCategory();
        console.log('Bookings:', bookings.length, 'rows');

        console.log('\nTesting getRevenueTrend...');
        const revenue = await adminDashboardRepository.getRevenueTrend();
        console.log('Revenue Trend:', revenue.length, 'rows');

        console.log('\nTesting getCategoryDistribution...');
        const dist = await adminDashboardRepository.getCategoryDistribution();
        console.log('Distribution:', dist.length, 'rows');

        console.log('\nTesting getTopPerformingShops...');
        const shops = await adminDashboardRepository.getTopPerformingShops();
        console.log('Shops:', shops.length, 'rows');

        console.log('\n✅ All queries executed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Query failed:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    }
}

testRepo();
