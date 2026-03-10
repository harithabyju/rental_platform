import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ReviewModal = ({ isOpen, onClose, booking, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/reviews', {
                itemId: booking.item_id,
                bookingId: booking.booking_id,
                rating,
                comment
            });
            toast.success('Review submitted successfully!');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1E293B] rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl shadow-black/50 animate-scale-up border border-gray-700/50">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Rate your Experience</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-700/50 rounded-full transition-colors">
                            <X size={20} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="transition-transform active:scale-90"
                                    >
                                        <Star
                                            size={32}
                                            className={`${star <= rating
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-gray-600'
                                                } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                            </span>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">
                                Your Feedback
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[120px] resize-none outline-none transition-all"
                                placeholder="How was the item and the service? (Optional)"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-900/30 hover:bg-emerald-500 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
