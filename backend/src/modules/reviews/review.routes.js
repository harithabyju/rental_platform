const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.post('/', protect, reviewController.addReview);
router.get('/item/:itemId', reviewController.getReviewsByItem);

module.exports = router;
