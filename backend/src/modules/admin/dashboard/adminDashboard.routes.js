const express = require('express');
const router = express.Router();
const adminDashboardController = require('./adminDashboard.controller');
const { protect } = require('../../../middlewares/authMiddleware');
const { authorize } = require('../../../middlewares/roleMiddleware');

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', adminDashboardController.getDashboardData);

module.exports = router;
