const db = require('../../../config/db');

const getDashboardStats = async () => {
    const stats = await db.query(`
        SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
            (SELECT COUNT(*) FROM users WHERE role = 'shop_owner') as total_shops,
            (SELECT SUM(amount) FROM payments WHERE status = 'completed') as total_revenue,
            (SELECT COUNT(*) FROM bookings WHERE status = 'active') as active_rentals
    `);
    return stats.rows[0];
};

const getBookingsByCategory = async () => {
    const result = await db.query(`
        SELECT c.name as category, COUNT(b.id) as booking_count
        FROM categories c
        LEFT JOIN items i ON c.id = i.category_id
        LEFT JOIN bookings b ON i.id = b.item_id
        GROUP BY c.name
    `);
    return result.rows;
};

const getRevenueTrend = async () => {
    const result = await db.query(`
        SELECT 
            TO_CHAR(created_at, 'Mon YYYY') as month,
            SUM(amount) as revenue,
            MIN(created_at) as month_start
        FROM payments
        WHERE status = 'completed'
        GROUP BY month
        ORDER BY month_start
    `);
    return result.rows;
};

const getCategoryDistribution = async () => {
    const result = await db.query(`
        SELECT c.name as category, COUNT(i.id) as item_count
        FROM categories c
        LEFT JOIN items i ON c.id = i.category_id
        GROUP BY c.name
    `);
    return result.rows;
};

const getTopPerformingShops = async () => {
    const result = await db.query(`
        SELECT 
            s.name as shop_name,
            s.location,
            COUNT(DISTINCT i.id) as total_items,
            COUNT(DISTINCT b.id) as total_rentals,
            COALESCE(SUM(p.amount), 0) as earnings,
            s.rating
        FROM shops s
        LEFT JOIN items i ON s.id = i.shop_id
        LEFT JOIN bookings b ON i.id = b.item_id
        LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
        GROUP BY s.id
        ORDER BY earnings DESC
        LIMIT 5
    `);
    return result.rows;
};

module.exports = {
    getDashboardStats,
    getBookingsByCategory,
    getRevenueTrend,
    getCategoryDistribution,
    getTopPerformingShops
};
