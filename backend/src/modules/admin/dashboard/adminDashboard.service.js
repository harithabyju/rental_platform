const adminDashboardRepository = require('./adminDashboard.repository');

const getFullDashboardData = async () => {
    const stats = await adminDashboardRepository.getDashboardStats();
    const bookingsByCategory = await adminDashboardRepository.getBookingsByCategory();
    const revenueTrend = await adminDashboardRepository.getRevenueTrend();
    const categoryDistribution = await adminDashboardRepository.getCategoryDistribution();
    const topShops = await adminDashboardRepository.getTopPerformingShops();

    return {
        stats: {
            totalCustomers: parseInt(stats.total_customers || 0),
            totalShops: parseInt(stats.total_shops || 0),
            pendingShops: parseInt(stats.pending_shops || 0),
            totalRevenue: parseFloat(stats.total_revenue || 0),
            activeRentals: parseInt(stats.active_rentals || 0)
        },
        charts: {
            bookingsByCategory,
            revenueTrend: revenueTrend.map(item => ({
                month: item.month,
                revenue: parseFloat(item.revenue)
            })),
            categoryDistribution: categoryDistribution.map(item => ({
                name: item.category,
                value: parseInt(item.item_count)
            }))
        },
        topShops: topShops.map(shop => ({
            name: shop.shop_name,
            location: shop.location,
            totalItems: parseInt(shop.total_items),
            totalRentals: parseInt(shop.total_rentals),
            earnings: parseFloat(shop.earnings),
            rating: parseFloat(shop.rating)
        }))
    };
};

module.exports = {
    getFullDashboardData
};
