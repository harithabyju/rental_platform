const db = require('../../config/db');

class SearchRepository {
    async findItems({ categoryId, lat, lng, radius, startDate, endDate, sortBy }) {
        let query = `
            SELECT i.*, c.name as category_name,
                (6371 * acos(
                    cos(radians($1)) * cos(radians(i.latitude)) *
                    cos(radians(i.longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(i.latitude))
                )) AS distance
            FROM items i
            JOIN categories c ON i.category_id = c.id
            WHERE 1=1
        `;

        const params = [lat, lng];
        let paramCount = 2;

        if (categoryId) {
            paramCount++;
            query += ` AND i.category_id = $${paramCount}`;
            params.push(categoryId);
        }

        // Availability check: subquery to check for overlapping confirmed bookings
        if (startDate && endDate) {
            query += ` AND i.id NOT IN (
                SELECT item_id 
                FROM bookings 
                WHERE status = 'confirmed' 
                AND NOT (end_date < $${++paramCount} OR start_date > $${++paramCount})
            )`;
            params.push(startDate, endDate);
        }

        // Radius filter
        if (radius) {
            paramCount++;
            query += ` AND (6371 * acos(
                cos(radians($1)) * cos(radians(i.latitude)) *
                cos(radians(i.longitude) - radians($2)) +
                sin(radians($1)) * sin(radians(i.latitude))
            )) <= $${paramCount}`;
            params.push(radius);
        }

        // Sorting
        if (sortBy === 'distance') {
            query += ` ORDER BY distance ASC`;
        } else if (sortBy === 'price_asc') {
            query += ` ORDER BY price_per_day ASC`;
        } else if (sortBy === 'price_desc') {
            query += ` ORDER BY price_per_day DESC`;
        } else {
            query += ` ORDER BY i.created_at DESC`;
        }

        const { rows } = await db.query(query, params);
        return rows;
    }
}

module.exports = new SearchRepository();
