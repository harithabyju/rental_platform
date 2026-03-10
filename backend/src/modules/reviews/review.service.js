const reviewRepository = require('./review.repository');
const db = require('../../config/db');

const addReview = async (userId, reviewData) => {
    const { itemId, bookingId, rating, comment } = reviewData;

    // 1. Validate that the booking belongs to the user and is completed or active
    // (Ideally completed, but users might want to review active rentals too)
    const bookingRes = await db.query(
        'SELECT * FROM bookings WHERE booking_id = $1 AND user_id = $2',
        [bookingId, userId]
    );

    if (bookingRes.rows.length === 0) {
        throw new Error('Booking not found or unauthorized');
    }

    const booking = bookingRes.rows[0];
    if (booking.item_id !== parseInt(itemId)) {
        throw new Error('Booking does not match item');
    }

    // Check if review already exists for this booking
    const existingReview = await db.query(
        'SELECT id FROM reviews WHERE booking_id = $1 AND user_id = $2',
        [bookingId, userId]
    );

    if (existingReview.rows.length > 0) {
        throw new Error('You have already reviewed this booking');
    }

    return reviewRepository.createReview({
        user_id: userId,
        item_id: itemId,
        booking_id: bookingId,
        rating,
        comment
    });
};

const getReviewsByItem = async (itemId) => {
    return reviewRepository.getReviewsByItem(itemId);
};

module.exports = {
    addReview,
    getReviewsByItem
};
