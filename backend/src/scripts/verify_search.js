const axios = require('axios');

const API_URL = 'http://localhost:5000';

const testSearch = async () => {
    try {
        console.log('--- Testing Search API ---');

        // 0. Login to get token
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Login successful.');

        // 1. Basic search by category
        console.log('\n1. Searching for "vehicles" near Delhi...');
        const res1 = await axios.get(`${API_URL}/search/items`, {
            ...config,
            params: {
                category: 'vehicles',
                lat: 28.6315,
                lng: 77.2167,
                radius: 10,
                start_date: '2026-03-01',
                end_date: '2026-03-05'
            }
        });
        console.log(`Found ${res1.data.items.length} items.`);
        if (res1.data.items.length > 0) {
            console.log(`Success: Found "${res1.data.items[0].name}" at ${res1.data.items[0].distance.toFixed(2)}km`);
        }

        // 2. Search with small radius
        console.log('\n2. Searching with 1km radius (should be fewer results)...');
        const res2 = await axios.get(`${API_URL}/search/items`, {
            ...config,
            params: {
                category: 'vehicles',
                lat: 28.6315,
                lng: 77.2167,
                radius: 1,
                start_date: '2026-03-01',
                end_date: '2026-03-05'
            }
        });
        console.log(`Found ${res2.data.items.length} items within 1km.`);

        // 3. Testing sort by price
        console.log('\n3. Testing sort by price...');
        const res3 = await axios.get(`${API_URL}/search/items`, {
            ...config,
            params: {
                category: 'electronics',
                lat: 28.6315,
                lng: 77.2167,
                radius: 50,
                start_date: '2026-03-01',
                end_date: '2026-03-05',
                sort: 'price'
            }
        });
        if (res3.data.items.length > 1) {
            const isSorted = parseFloat(res3.data.items[0].price) <= parseFloat(res3.data.items[1].price);
            console.log(`Price Sort Check: ${isSorted ? 'PASSED' : 'FAILED'} (${res3.data.items[0].price} vs ${res3.data.items[1].price})`);
        } else {
            console.log('Not enough items to test price sort.');
        }

        console.log('\n--- API Verification Finished ---');
    } catch (error) {
        console.error('Search API test failed:', error.response?.data || error.message);
    }
};

testSearch();
