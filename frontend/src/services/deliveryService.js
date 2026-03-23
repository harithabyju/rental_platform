import api from './api';

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
        const res = await api.get('/delivery/options', { params });
        return res.data;
    },

    /**
     * Get delivery status and timeline for a booking (customer)
     * @param {number} bookingId
     */
    getDeliveryStatus: async (bookingId) => {
        const res = await api.get(`/delivery/${bookingId}/status`);
        return res.data;
    },

    /**
     * Update delivery status (shop owner)
     * @param {number} bookingId
     * @param {string} status - new status value
     */
    updateDeliveryStatus: async (bookingId, status) => {
        const res = await api.patch(`/delivery/${bookingId}/status`, { status });
        return res.data;
    },

    /**
     * Get all deliveries for shop owner's shops
     * @param {string} statusFilter - optional e.g. 'pending', 'all'
     */
    getShopDeliveries: async (statusFilter = 'all') => {
        const res = await api.get('/delivery/shop/pending', {
            params: { status: statusFilter },
        });
        return res.data;
    },
};

export default deliveryService;
