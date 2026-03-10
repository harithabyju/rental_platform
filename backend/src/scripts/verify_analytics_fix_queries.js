const db = require('../config/db');
const adminDashboardRepository = require('../modules/admin/dashboard/adminDashboard.repository');

async function verify() {
    try {
        console.log('--- Verifying Dashboard Stats ---');
        const stats = await adminDashboardRepository.getDashboardStats();
        console.log('Stats:', stats);

        console.log('\n--- Verifying Registration Trend ---');
        const trend = await adminDashboardRepository.getRegistrationTrend();
        console.log('Trend:', trend);

        console.log('\n--- SUCCESS: Queries executed successfully ---');
        process.exit(0);
    } catch (err) {
        console.error('\n--- FAILURE: ', err.message);
        process.exit(1);
    }
}

verify();
