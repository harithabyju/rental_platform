const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

router.post( '/admin/categories', protect, authorize('admin'), categoryController.createCategory);
router.put( '/admin/categories/:id', protect, authorize('admin'), categoryController.updateCategory );
router.delete( '/admin/categories/:id', protect, authorize('admin'), categoryController.deleteCategory )
router.get('/categories', categoryController.getAllCategories);
module.exports = router;
