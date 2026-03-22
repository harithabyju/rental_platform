require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// ABSOLUTELY FIRST LOGGER
app.use((req, res, next) => {
    console.log(`>>> [SERVER HIT] ${req.method} ${req.url} [IP: ${req.ip}] [UA: ${req.get('User-Agent')}]`);
    next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Detailed Request Logger (after parsing)
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log(`[POST DATA] ${req.url}:`, JSON.stringify(req.body, null, 2));
    }
    next();
});

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Test DB Connection
app.get('/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ status: 'ok', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

const userRoutes = require('./modules/users/user.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const shopRoutes = require('./modules/shops/shop.routes');
const itemRoutes = require('./modules/items/item.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const adminDashboardRoutes = require('./modules/admin/dashboard/adminDashboard.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const searchRoutes = require('./modules/search/search.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const deliveryRoutes = require('./modules/delivery/delivery.routes');

// Use Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
