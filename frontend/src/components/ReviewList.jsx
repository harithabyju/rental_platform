import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import api from '../services/api';

const ReviewList = ({ itemId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await api.get(`/reviews/item/${itemId}`);
                setReviews(res.data);
            } catch (err) {
                console.error("Failed to load reviews:", err);
            } finally {
                setLoading(false);
            }
        };

        if (itemId) {
            fetchReviews();
        }
    }, [itemId]);

    if (loading) {
        return <div className="animate-pulse flex space-x-4 p-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div></div></div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] p-8 text-center border border-gray-100 dark:border-gray-800/60 mt-8">
                <div className="w-16 h-16 bg-white dark:bg-[#111827] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-1">No Reviews Yet</h3>
                <p className="text-sm text-gray-500 font-medium">Be the first to rent and review this item!</p>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-emerald-500 fill-emerald-500" /> 
                Customer Reviews 
                <span className="text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full ml-1">
                    {reviews.length}
                </span>
            </h3>
            
            <div className="space-y-4">
                {reviews.map((review, index) => (
                    <div key={review.id || index} className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-lg">
                                    {(review.user_name || review.reviewer_name)?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-gray-100">{review.user_name || review.reviewer_name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star} 
                                        size={14} 
                                        className={star <= review.rating ? 'fill-emerald-500 text-emerald-500' : 'text-gray-300 dark:text-gray-600'} 
                                    />
                                ))}
                            </div>
                        </div>
                        {review.comment && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed pl-13">
                                "{review.comment}"
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewList;
