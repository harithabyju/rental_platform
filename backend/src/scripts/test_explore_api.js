const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testExplore() {
    try {
        console.log('--- Testing Explore (Search) API ---');

        const params = {
            category: '',
            lat: 28.6139,
            lng: 77.2090,
            radius: 10,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            sort: 'distance',
            page: 1,
            limit: 12,
            q: ''
        };

        console.log('Params:', params);

        const response = await axios.get(`${API_URL}/search/items`, { params });

        console.log(`\nStatus: ${response.status}`);
        console.log(`Items found: ${response.data.items.length}`);

        if (response.data.items.length > 0) {
            console.table(response.data.items.map(item => ({
                id: item.id,
                name: item.name,
                shop: item.shop_name,
                distance: item.distance
            })));
        } else {
            console.log('No items returned by the API.');
        }

    } catch (error) {
        console.error('Error testing explore:', error.response?.data || error.message);
    }
}

testExplore();
