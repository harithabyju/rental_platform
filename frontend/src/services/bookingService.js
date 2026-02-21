import api from './api';

export const createBooking = async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
};

export const getMyBookings = async () => {
    const response = await api.get('/bookings/my');
    return response.data;
};

export const cancelBooking = async (bookingId) => {
    const response = await api.patch(`/bookings/cancel/${bookingId}`);
    return response.data;
};

export const extendBooking = async (bookingId, newEndDate) => {
    const response = await api.patch(`/bookings/extend/${bookingId}`, { newEndDate });
    return response.data;
};

export const returnBooking = async (bookingId) => {
    const response = await api.patch(`/bookings/return/${bookingId}`);
    return response.data;
};
