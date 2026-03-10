import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { BACKEND_URL } from '../services/api';

const ItemCard = ({ item }) => {
    const navigate = useNavigate();
    const {
        id,
        name,
        shop_name,
        price,
        avg_rating,
        item_rating,
        distance,
        image_url,
        is_available
    } = item;

    const isAvailable = item.is_available !== false;
    const rating = parseFloat(avg_rating || item_rating || 0);

    const imgSrc = image_url
        ? (image_url.startsWith('http') ? image_url : `${BACKEND_URL}${image_url}`)
        : 'https://placehold.co/400x300/1E293B/64748B?text=No+Image';

    const handleBookNow = () => {
        navigate(`/dashboard/booking/${id}`);
    };

    return (
        <div className="bg-white dark:bg-[#111827] rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:shadow-black/30 transition-shadow duration-300 border border-gray-100 dark:border-gray-800/60 flex flex-col h-full group">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={imgSrc}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-sm font-semibold text-emerald-400 border border-gray-200 dark:border-gray-700/30">
                    <FaStar className="text-amber-400" />
                    {rating > 0 ? rating.toFixed(1) : 'New'}
                </div>
                {distance !== undefined && (
                    <div className="absolute bottom-3 left-3 bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-xs font-medium text-white">
                        <FaMapMarkerAlt />
                        {parseFloat(distance).toFixed(1)} km
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">{name}</h3>
                </div>

                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                    <span>from</span>
                    <span className="font-medium text-gray-500 dark:text-gray-400">{shop_name}</span>
                </p>

                <div className="mt-auto">
                    <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-xl font-bold text-emerald-400">₹{price}</span>
                        <span className="text-xs text-gray-500 font-medium">/ day</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${isAvailable
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/20'
                            : 'bg-red-900/40 text-red-400 border border-red-700/20'
                            }`}>
                            {isAvailable ? 'Available' : 'Booked'}
                        </span>

                        <button
                            onClick={handleBookNow}
                            disabled={!isAvailable}
                            className={`flex-grow py-2 rounded-lg font-bold text-sm transition-all duration-200 ${isAvailable
                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-900/30'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
