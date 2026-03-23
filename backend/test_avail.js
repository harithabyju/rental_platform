const db = require('./src/config/db');
const dashboardQuery = require('./src/modules/dashboard/dashboard.query');

async function testAvailability() {
    try {
        console.log('--- Searching for "Car" without dates ---');
        const resultsAll = await dashboardQuery.searchItems({ q: 'Car', limit: 10, offset: 0 });
        console.log('Result (No dates):', resultsAll[0]?.available_quantity);

        console.log('\n--- Searching for "Car" during booking period (2026-03-24 to 2026-03-25) ---');
        const resultsPeriod = await dashboardQuery.searchItems({ 
            q: 'Car', 
            startDate: '2026-03-24', 
            endDate: '2026-03-25', 
            limit: 10, 
            offset: 0 
        });
        console.log('Result (With dates):', resultsPeriod[0]?.available_quantity);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testAvailability();
