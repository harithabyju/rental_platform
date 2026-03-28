const db = require('../config/db');

async function listShopOwners() {
    try {
        const res = await db.query("SELECT id, fullname, email, role, otp, verified, created_at FROM users WHERE role = 'shop_owner' ORDER BY created_at DESC LIMIT 10");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

listShopOwners();
