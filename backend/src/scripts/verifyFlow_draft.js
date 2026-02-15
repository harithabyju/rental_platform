const axios = require('axios');

const API_URL = 'http://localhost:5000';

const runVerification = async () => {
    try {
        console.log('--- Starting Verification ---');

        // 1. Register User (Shop Owner)
        const ownerEmail = `owner${Date.now()}@test.com`;
        console.log(`1. Registering user: ${ownerEmail}`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            fullname: 'Test Owner',
            email: ownerEmail,
            password: 'password123',
            role: 'customer' // Will register shop later
        });
        const ownerUser = regRes.data.user;
        console.log('   User registered.');

        // 2. Verify OTP (Mocking logic needed? Or just manually verify in DB? 
        // My verifyOtp endpoint requires OTP from email.
        // I can cheat by updating DB directly or using a backdoor if I had one.
        // For this script, I'll use direct DB update to verify user.
        // Wait, I can't import db here easily if I run this as standalone script outside src/scripts context or I need to require db config.
        // I'll assume I can use `pg` directly or just use the `verifyUser` function if I import it.
        // Better: I'll use the `db` module.
    } catch (error) {
        console.error('Verification Setup Failed:', error.message);
    }
};

// I'll write a better script that imports app components to avoid API calls if server isn't running, 
// OR I'll ensure server is running.
// Server IS running? I didn't start it explicitly with `run_command` in background.
// I should start the server to test API.
