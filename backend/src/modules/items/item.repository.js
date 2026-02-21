const db = require('../../config/db');

class ItemRepository {
    async findById(id) {
        const query = `
            SELECT i.*, s.working_hours, s.location_restrictions as shop_restrictions 
            FROM items i
            LEFT JOIN shops s ON i.shop_id = s.id
            WHERE i.id = $1;
        `;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async update(id, itemData) {
        const fields = [];
        const values = [];
        let idx = 1;

        for (const [key, value] of Object.entries(itemData)) {
            fields.push(`${key} = $${idx++}`);
            values.push(value);
        }

        values.push(id);
        const query = `UPDATE items SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *;`;
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = new ItemRepository();
