import api from './api';

// Dashboard Summary
export const getDashboardSummary = () =>
    api.get('/dashboard/summary').then(r => r.data);

// Categories
export const getCategories = () =>
    api.get('/categories').then(r => r.data);

// Items by Category
export const getItemsByCategory = (categoryId, page = 1, pageSize = 12) =>
    api.get(`/items/category/${categoryId}`, { params: { page, pageSize } }).then(r => r.data);

// Shop availability for an item
export const getShopsForItem = (itemId) =>
    api.get(`/dashboard/items/${itemId}/shops`).then(r => r.data);

// Search items with filters — only pass params accepted by the search Joi schema
export const searchItems = (params) => {
    const formattedParams = {
        q: params.q || '',
        // Map categoryId (frontend) → category (backend search schema)
        category: params.category || params.categoryId || undefined,
        // Allow null to enable global search bypass in backend
        lat: params.lat !== undefined && params.lat !== null ? params.lat : null,
        lng: params.lng !== undefined && params.lng !== null ? params.lng : null,
        radius: params.radius || 50, // Default to 50km for broader discovery
        start_date: params.start_date || new Date().toISOString().split('T')[0],
        end_date: params.end_date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        limit: params.limit || 10,
        page: params.page || 1,
        sort: params.sort || 'distance',
    };

    // Remove undefined/null so they don't get sent as query params
    Object.keys(formattedParams).forEach(key => {
        if (formattedParams[key] === undefined || formattedParams[key] === null || formattedParams[key] === '') {
            delete formattedParams[key];
        }
    });

    return api.get('/search/items', { params: formattedParams }).then(r => r.data);
};

// Payment history — correct dashboard path
export const getMyPayments = (page = 1, pageSize = 10) =>
    api.get('/dashboard/payments/my', { params: { page, pageSize } }).then(r => r.data);

// Active rentals — correct dashboard path
export const getActiveRentals = () =>
    api.get('/dashboard/rentals/active').then(r => r.data);

// Profile Stats — correct dashboard path
export const getProfileStats = () =>
    api.get('/dashboard/profile/stats');

// Shop item details
export const getShopItemDetails = (shopItemId) =>
    api.get(`/dashboard/shop-items/${shopItemId}`).then(r => r.data);

// Nearby shops
export const getNearbyShops = (params) =>
    api.get('/shops/nearby', { params }).then(r => r.data);
