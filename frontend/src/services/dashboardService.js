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
    api.get(`/items/${itemId}/shops`).then(r => r.data);

// Search items with filters
export const searchItems = (params) =>
    api.get('/items/search', { params }).then(r => r.data);

// Payment history
export const getMyPayments = (page = 1, pageSize = 10) =>
    api.get('/payments/my', { params: { page, pageSize } }).then(r => r.data);

// Active rentals
export const getActiveRentals = () =>
    api.get('/rentals/active').then(r => r.data);

// Profile Stats
export const getProfileStats = () =>
    api.get('/profile/stats').then(r => r.data);

