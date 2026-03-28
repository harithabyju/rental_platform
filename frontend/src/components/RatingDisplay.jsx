import { Star } from 'lucide-react';

const RatingDisplay = ({ rating = 0, totalReviews, size = 'sm' }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {stars.map((star) => (
                    <Star
                        key={star}
                        className={`${iconSize} ${star <= Math.round(rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-800 dark:text-gray-200 fill-gray-200'
                            }`}
                    />
                ))}
            </div>
            <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                {parseFloat(rating) > 0 ? parseFloat(rating).toFixed(1) : 'New'}
            </span>
            {totalReviews !== undefined && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase">
                    ({totalReviews} Reviews)
                </span>
            )}
        </div>
    );
};

export default RatingDisplay;
