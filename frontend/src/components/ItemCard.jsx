import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaCalendarCheck } from 'react-icons/fa';

const ItemCard = ({ item }) => {
    const navigate = useNavigate();
    const {
        id, // This is the shop_item id from the search query
        name,
        shop_name,
        price,
        avg_rating,
        item_rating, // Fallback if avg_rating is missing
        distance,
        image_url,
        is_available
    } = item;

    const isAvailable = item.is_available !== false; // Handle potential undefined/null as available if flag is missing, but backend sends true/false

    const rating = avg_rating || item_rating || 0;

    const handleBookNow = () => {
        navigate(`/dashboard/booking/${id}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full group">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image_url || 'https://placehold.co/400x300?text=No+Image'}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-sm font-semibold text-gray-800">
                    <FaStar className="text-yellow-400" />
                    {parseFloat(rating).toFixed(1)}
                </div>
                {distance !== undefined && (
                    <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-xs font-medium text-white">
                        <FaMapMarkerAlt />
                        {parseFloat(distance).toFixed(1)} km
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{name}</h3>
                </div>

                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                    <span>from</span>
                    <span className="font-medium text-gray-700">{shop_name}</span>
                </p>

                <div className="mt-auto">
                    <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-xl font-bold text-blue-600">₹{price}</span>
                        <span className="text-xs text-gray-500 font-medium">/ day</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${isAvailable
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {isAvailable ? 'Available' : 'Booked'}
                        </span>

                        <button
                            onClick={handleBookNow}
                            disabled={!isAvailable}
                            className={`flex-grow py-2 rounded-lg font-bold text-sm transition-all duration-200 ${isAvailable
                                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
