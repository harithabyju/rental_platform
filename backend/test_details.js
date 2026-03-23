const dashboardService = require('./src/modules/dashboard/dashboard.service');

async function testDetails() {
    try {
        console.log('--- Testing getShopItemDetails (Item 10) ---');
        const detail = await dashboardService.getShopItemDetails(10); // Shop item ID 10 is the Car
        console.log('Details:', JSON.stringify(detail, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testDetails();
