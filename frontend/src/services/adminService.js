import api from './api';

const getDashboardData = async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
};

const adminService = {
    getDashboardData
};

export default adminService;
