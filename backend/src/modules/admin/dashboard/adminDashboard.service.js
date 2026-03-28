const adminDashboardRepository = require('./adminDashboard.repository');

const getFullDashboardData = async () => {
    const stats = await adminDashboardRepository.getDashboardStats();
    const bookingsByCategory = await adminDashboardRepository.getBookingsByCategory();
    const revenueTrend = await adminDashboardRepository.getRevenueTrend();
    const registrationTrend = await adminDashboardRepository.getRegistrationTrend();
    const categoryDistribution = await adminDashboardRepository.getCategoryDistribution();
    const topShops = await adminDashboardRepository.getTopPerformingShops();

    return {
        stats: {
            totalUsers: parseInt(stats.total_users || 0),
            totalCustomers: parseInt(stats.total_customers || 0),
            totalShops: parseInt(stats.total_shops || 0),
            pendingApprovals: parseInt(stats.pending_approvals || 0),
            totalPendingShops: parseInt(stats.total_pending_shops || 0),
            totalRevenue: parseFloat(stats.total_revenue || 0),
            activeRentals: parseInt(stats.active_rentals || 0)
        },
        charts: {
            bookingsByCategory,
            revenueTrend: revenueTrend.map(item => ({
                month: item.month,
                revenue: parseFloat(item.revenue)
            })),
            registrationTrend: registrationTrend.map(item => ({
                month: item.month,
                count: parseInt(item.count)
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
