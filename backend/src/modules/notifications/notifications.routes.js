const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/', protect, notificationsController.getNotifications);
router.patch('/:id/read', protect, notificationsController.markAsRead);

module.exports = router;
