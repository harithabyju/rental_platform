import axios from 'axios';

const API_URL = 'http://localhost:5000/bookings';

// Helper to get auth header (assuming token is stored in localStorage)
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const createBooking = async (bookingData) => {
    const response = await axios.post(API_URL, bookingData, getAuthHeader());
    return response.data;
};

export const getMyBookings = async () => {
    const response = await axios.get(`${API_URL}/my`, getAuthHeader());
    return response.data;
};

export const cancelBooking = async (bookingId) => {
    const response = await axios.patch(`${API_URL}/cancel/${bookingId}`, {}, getAuthHeader());
    return response.data;
};

export const extendBooking = async (bookingId, newEndDate) => {
    const response = await axios.patch(`${API_URL}/extend/${bookingId}`, { newEndDate }, getAuthHeader());
    return response.data;
};

export const returnBooking = async (bookingId) => {
    const response = await axios.patch(`${API_URL}/return/${bookingId}`, {}, getAuthHeader());
    return response.data;
};
