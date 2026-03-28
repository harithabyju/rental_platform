import api from './api';

const reportDamage = async (damageData) => {
    const response = await api.post('/compliance/damages', damageData);
    return response.data;
};

const resolveDamage = async (reportId, resolutionData) => {
    const response = await api.post(`/compliance/damages/${reportId}/resolve`, resolutionData);
    return response.data;
};

const raiseDispute = async (disputeData) => {
    const response = await api.post('/compliance/disputes', disputeData);
    return response.data;
};

const resolveDispute = async (disputeId, resolutionData) => {
    const response = await api.post(`/compliance/disputes/${disputeId}/resolve`, resolutionData);
    return response.data;
};

const submitReview = async (reviewData) => {
    const response = await api.post('/compliance/reviews', reviewData);
    return response.data;
};

const moderateReview = async (reviewId, moderationData) => {
    const response = await api.post(`/compliance/reviews/${reviewId}/moderate`, moderationData);
    return response.data;
};

export default {
    reportDamage,
    resolveDamage,
    raiseDispute,
    resolveDispute,
    submitReview,
    moderateReview
};
