const adminDashboardService = require('./adminDashboard.service');

const getDashboardData = async (req, res, next) => {
    try {
        const data = await adminDashboardService.getFullDashboardData();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getDashboardData:', error);
        next(error);
    }
};

module.exports = {
    getDashboardData
};
