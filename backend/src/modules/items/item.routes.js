const express = require('express');
const router = express.Router();
const itemController = require('./item.controller');
const { protect } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/upload.middleware');

// Shop Owner Routes (requires authentication + image upload middleware)
router.post('/items', protect, upload.single('image'), itemController.addItem);
router.put('/items/:id', protect, upload.single('image'), itemController.updateItem);
router.delete('/items/:id', protect, itemController.deleteItem);

// Public / Customer Routes
router.get('/items', itemController.getAllItems);
router.get('/items/shop/:shopId', itemController.getItemsByShop);
router.get('/items/:id', itemController.getItemById);

module.exports = router;
