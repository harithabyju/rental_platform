import api from './api';

const getBookingById = async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
};

const bookingService = {
    getBookingById,
};

export default bookingService;
