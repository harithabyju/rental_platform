const db = require('../../config/db');

class ShopRepository {
    async create(shopData) {
        const { owner_id, name, working_hours, location_restrictions } = shopData;
        const query = `
            INSERT INTO shops (owner_id, name, working_hours, location_restrictions)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [owner_id, name, JSON.stringify(working_hours), location_restrictions]);
        return rows[0];
    }

    async findById(id) {
        const query = `SELECT * FROM shops WHERE id = $1;`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async findByOwnerId(ownerId) {
        const query = `SELECT * FROM shops WHERE owner_id = $1;`;
        const { rows } = await db.query(query, [ownerId]);
        return rows;
    }

    async update(id, shopData) {
        const fields = [];
        const values = [];
        let idx = 1;

        for (const [key, value] of Object.entries(shopData)) {
            fields.push(`${key} = $${idx++}`);
            values.push(key === 'working_hours' ? JSON.stringify(value) : value);
        }

        values.push(id);
        const query = `
            UPDATE shops 
            SET ${fields.join(', ')} 
            WHERE id = $${idx} 
            RETURNING *;
        `;
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = new ShopRepository();
