const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

router.post('/admin', protect, authorize('admin'), categoryController.createCategory);
router.put('/admin/:id', protect, authorize('admin'), categoryController.updateCategory);
router.delete('/admin/:id', protect, authorize('admin'), categoryController.deleteCategory)
router.get('/', categoryController.getAllCategories);
module.exports = router;
