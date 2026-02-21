const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const adminDashboardRoutes = require('./modules/admin/dashboard/adminDashboard.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');

// Use Routes
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);



// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
