const express = require('express');
const router = express.Router();
const itemController = require('./item.controller');
const { protect } = require('../../middlewares/authMiddleware');

// Shop Owner Routes
router.post('/items', protect, itemController.addItem);
router.put('/items/:id', protect, itemController.updateItem);
router.delete('/items/:id', protect, itemController.deleteItem);

// Public/Customer Routes
router.get('/items/shop/:shopId', itemController.getItemsByShop);
router.get('/items/:id', itemController.getItemById);

module.exports = router;
