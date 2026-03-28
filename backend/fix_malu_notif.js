const db = require('./src/config/db');

async function fixMalu() {
    try {
        // 1. Find Malu
        const userRes = await db.query("SELECT id FROM users WHERE fullname ILIKE '%Malu%'");
        if (userRes.rows.length === 0) {
            console.log('Malu not found');
            process.exit(0);
        }
        const maluId = userRes.rows[0].id;
        console.log('Malu ID:', maluId);

        // 2. Find her fine for the bike
        const fineRes = await db.query("SELECT * FROM fines WHERE user_id = $1 AND status = 'pending' ORDER BY created_at DESC LIMIT 1", [maluId]);
        if (fineRes.rows.length === 0) {
            console.log('No pending fine found for Malu');
            process.exit(0);
        }
        const fine = fineRes.rows[0];
        console.log('Fine found:', fine);

        // 3. Create a manual notification
        await db.query(
            "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
            [maluId, 'Late Return Fine', `You have a pending fine of ₹${fine.amount} for a late return.`, 'warning']
        );
        console.log('Manual notification created for Malu');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fixMalu();
