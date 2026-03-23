import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const deliveryService = {
    /**
     * Get delivery options (fee estimate + ETA) based on shop and customer location
     * @param {number} shopId
     * @param {number|null} lat - customer latitude
     * @param {number|null} lng - customer longitude
     */
    getDeliveryOptions: async (shopId, lat = null, lng = null) => {
        const params = { shopId };
        if (lat) params.lat = lat;
        if (lng) params.lng = lng;
        const res = await axios.get(`${API_URL}/delivery/options`, { params });
        return res.data;
    },

    /**
     * Get delivery status and timeline for a booking (customer)
     * @param {number} bookingId
     */
    getDeliveryStatus: async (bookingId) => {
        const res = await axios.get(`${API_URL}/delivery/${bookingId}/status`, {
            headers: getAuthHeader(),
        });
        return res.data;
    },

    /**
     * Update delivery status (shop owner)
     * @param {number} bookingId
     * @param {string} status - new status value
     */
    updateDeliveryStatus: async (bookingId, status) => {
        const res = await axios.patch(
            `${API_URL}/delivery/${bookingId}/status`,
            { status },
            { headers: getAuthHeader() }
        );
        return res.data;
    },

    /**
     * Get all deliveries for shop owner's shops
     * @param {string} statusFilter - optional e.g. 'pending', 'all'
     */
    getShopDeliveries: async (statusFilter = 'all') => {
        const res = await axios.get(`${API_URL}/delivery/shop/pending`, {
            headers: getAuthHeader(),
            params: { status: statusFilter },
        });
        return res.data;
    },
};

export default deliveryService;
