require('dotenv').config({ path: 'c:/Users/priya/OneDrive/Desktop/rental_platform/backend/.env' });
const adminDashboardService = require('c:/Users/priya/OneDrive/Desktop/rental_platform/backend/src/modules/admin/dashboard/adminDashboard.service.js');
const fs = require('fs');

async function test() {
    try {
        const data = await adminDashboardService.getFullDashboardData();
        fs.writeFileSync('c:/Users/priya/OneDrive/Desktop/rental_platform/backend/dashboard_dump.json', JSON.stringify({ success: true, data: data }));
    } catch (e) {
        fs.writeFileSync('c:/Users/priya/OneDrive/Desktop/rental_platform/backend/dashboard_dump.json', JSON.stringify({ success: false, error: e.message, stack: e.stack }));
    } finally {
        process.exit();
    }
}
test();
