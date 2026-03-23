const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgres://postgres:postgres@localhost:5432/rental_platform'
});

async function backfill() {
    try {
        const bookings = [
            { id: 46, address: "mookkanoor,angamaly, ernakulam - 683577", city: "ernakulam", fee: 50 },
            { id: 47, address: "mookkanoor,angamaly, ernakulam - 683577", city: "ernakulam", fee: 50 }
        ];

        for (const b of bookings) {
            console.log(`Processing booking ${b.id}...`);
            const agent = { name: 'Ravi Kumar', phone: '+91-98765-01234' };
            const estimatedDeliveryAt = new Date();
            estimatedDeliveryAt.setHours(estimatedDeliveryAt.getHours() + 24);

            await pool.query(
                `INSERT INTO delivery_orders 
                 (booking_id, delivery_address, delivery_city, estimated_fee_inr, estimated_delivery_at, agent_name, agent_phone, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
                 ON CONFLICT (booking_id) DO NOTHING`,
                [b.id, b.address, b.city, b.fee, estimatedDeliveryAt, agent.name, agent.phone]
            );
        }
        console.log('Backfill complete!');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

backfill();
