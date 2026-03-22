const axios = require('axios');
const fs = require('fs');

async function testApi() {
    try {
        // Log in to get token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;

        // Fetch dashboard
        const dashRes = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        fs.writeFileSync(__dirname + '/dashboard_api_result.json', JSON.stringify({ success: true, data: dashRes.data }, null, 2));
    } catch (e) {
        fs.writeFileSync(__dirname + '/dashboard_api_result.json', JSON.stringify({ 
            success: false, 
            status: e.response?.status, 
            data: e.response?.data, 
            message: e.message 
        }, null, 2));
    }
}
testApi();
