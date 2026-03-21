import api from './api';

const calculateFine = async (bookingId) => {
    const response = await api.post(`/fines/calculate/${bookingId}`);
    return response.data;
};

const reportDamage = async (damageData) => {
    const response = await api.post('/fines/damage/report', damageData);
    return response.data;
};

const approveDamageReport = async (reportId, amount) => {
    const response = await api.post('/fines/damage/approve', { reportId, amount });
    return response.data;
};

const getMyFines = async () => {
    const response = await api.get('/fines/my-fines');
    return response.data;
};

const getAllFines = async () => {
    const response = await api.get('/fines/admin/fines');
    return response.data;
};

const raiseDispute = async (disputeData) => {
    const response = await api.post('/fines/disputes', disputeData);
    return response.data;
};

const getDisputes = async () => {
    const response = await api.get('/fines/admin/disputes');
    return response.data;
};

const resolveDispute = async (id, resolutionData) => {
    const response = await api.patch(`/fines/admin/disputes/${id}`, resolutionData);
    return response.data;
};

const penaltyService = {
    calculateFine,
    reportDamage,
    approveDamageReport,
    getMyFines,
    getAllFines,
    raiseDispute,
    getDisputes,
    resolveDispute,
};

export default penaltyService;
