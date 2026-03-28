import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { BACKEND_URL } from '../services/api';
import BorderGlow from './BorderGlow';

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

    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const startDate = queryParams.get('startDate');
    const endDate = queryParams.get('endDate');

    const availableCount = item.available_quantity !== undefined ? item.available_quantity : (is_available !== false ? (item.total_quantity || 1) : 0);
    const totalCount = item.total_quantity || 1;
    const isActuallyAvailable = availableCount > 0;

    const rating = parseFloat(avg_rating || item_rating || 0);

    const imgSrc = image_url
        ? (image_url.startsWith('http') ? image_url : `${BACKEND_URL}${image_url}`)
        : 'https://placehold.co/400x300/1E293B/64748B?text=No+Image';

    const handleBookNow = () => {
        const dateParams = (startDate && endDate) ? `?startDate=${startDate}&endDate=${endDate}` : '';
        navigate(`/dashboard/booking/${id}${dateParams}`);
    };

    return (
        <BorderGlow className="h-full" borderRadius={12} animated={false}>
            <div className="bg-white/95 dark:bg-[#111827]/90 rounded-xl shadow-md overflow-hidden transition-shadow duration-300 flex flex-col h-full group border border-transparent">
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
                        <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-tight ${isActuallyAvailable
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                            }`}>
                            {isActuallyAvailable ? 'Available' : '0 Available'}
                        </span>

                        <button
                            onClick={handleBookNow}
                            disabled={!isActuallyAvailable}
                            className={`flex-grow py-2 rounded-lg font-black text-sm transition-all duration-200 ${isActuallyAvailable
                                ? 'bg-gray-900 text-white hover:bg-emerald-600 active:scale-95 shadow-md shadow-gray-200 hover:shadow-emerald-100'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isActuallyAvailable ? 'Reserve' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </BorderGlow>
    );
};

export default ItemCard;
