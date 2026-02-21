const axios = require('axios');

async function testDashboard() {
    try {
        console.log('Testing Admin Dashboard Stats API...');
        // Note: This requires a valid admin token. 
        // In a real scenario, I might need to login first or use a shortcut.
        // For now, I'll just check if the server is up and reachable.
        // Since I have the backend running, I can also check logs or just try a request.
        
        // But wait, the previous errors were 500, which means the route WAS reached but failed internally.
        // If I got 401/403, that would be different.
        
        const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats');
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.error('API Error:', err.response.status, err.response.data);
        } else {
            console.error('Request Error:', err.message);
        }
    }
}

testDashboard();
