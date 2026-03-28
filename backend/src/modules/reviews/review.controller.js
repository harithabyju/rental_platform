const reviewService = require('./review.service');

const addReview = async (req, res) => {
    console.log('Review Controller: addReview hit');
    try {
        const review = await reviewService.addReview(req.user.id, req.body);
        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
        console.log('Review Controller Error:', error.message);
        res.status(400).json({ message: error.message });
    }
};

const getReviewsByItem = async (req, res) => {
    try {
        const reviews = await reviewService.getReviewsByItem(req.params.itemId);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addReview,
    getReviewsByItem
};
