const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function createTestUser() {
    const client = new Client({
        connectionString: 'postgresql://postgres:jesus369@localhost:5432/rental_platform'
    });
    
    try {
        await client.connect();
        const hashedPassword = await bcrypt.hash('password123', 10);
        const query = `
            INSERT INTO users (fullname, email, password, role, verified)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
        `;
        const values = ['Test Load', 'loadtest@example.com', hashedPassword, 'customer', true];
        await client.query(query, values);
        console.log('Test user created or already exists');
    } catch (err) {
        console.error('Error creating test user:', err);
    } finally {
        await client.end();
    }
}

createTestUser();
