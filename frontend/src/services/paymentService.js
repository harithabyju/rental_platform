import api from './api';

const paymentService = {
    createOrder: async (bookingId, amount) => {
        try {
            const response = await api.post('/payments/create-order', {
                bookingId,
                amount
            });
            return response.data;
        } catch (error) {
            console.error('Error creating payment order:', error);
            throw error.response?.data || error.message;
        }
    },

    verifyPayment: async (paymentData) => {
        try {
            const response = await api.post('/payments/verify', paymentData);
            return response.data;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error.response?.data || error.message;
        }
    }
};

export default paymentService;
