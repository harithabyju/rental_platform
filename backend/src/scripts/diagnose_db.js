const { Client } = require('pg');

const passwords = ['admin', 'postgres', 'root', 'password', '1234', ''];
const user = 'postgres';

async function testConnection() {
    console.log('Testing database connections...');

    for (const password of passwords) {
        const client = new Client({
            user: user,
            host: 'localhost',
            database: 'postgres', // Connect to default DB first
            password: password,
            port: 5432,
        });

        try {
            await client.connect();
            console.log(`SUCCESS: Connected with password: '${password}'`);

            // Check if rental_platform db exists
            const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'rental_platform'");
            if (res.rows.length === 0) {
                console.log("Database 'rental_platform' does NOT exist. Creating it...");
                try {
                    await client.query('CREATE DATABASE rental_platform');
                    console.log("Database 'rental_platform' created successfully.");
                } catch (dbErr) {
                    console.error("Failed to create database:", dbErr.message);
                }
            } else {
                console.log("Database 'rental_platform' already exists.");
            }

            await client.end();
            return password; // Return the working password
        } catch (err) {
            console.log(`Failed with password '${password}': ${err.message}`);
            // client.end() is not needed if connect failed generally, but good practice if it partially opened? 
            // Actually pg client.connect() throws if it can't connect.
        }
    }
    console.log('All attempts failed.');
    return null;
}

testConnection();
