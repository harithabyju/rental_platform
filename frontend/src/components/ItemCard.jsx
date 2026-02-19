import { MapPin, Truck, Package, ArrowRight } from 'lucide-react';
import RatingDisplay from './RatingDisplay';
import { useNavigate } from 'react-router-dom';

const ItemCard = ({ item }) => {
    const navigate = useNavigate();

    return (
        <div className="card overflow-hidden group cursor-pointer animate-slide-up"
            onClick={() => navigate(`/dashboard/item/${item.id}/shops`)}>
            {/* Image */}
            <div className="relative overflow-hidden h-48">
                <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                />
                {/* Availability Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg ${item.isAvailable
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                </div>
                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                    {item.category?.name}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {item.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10 font-medium">{item.description}</p>

                {/* Rating */}
                <div className="mb-4">
                    <RatingDisplay rating={item.avgRating} totalReviews={item.totalReviews} />
                </div>

                {/* Delivery / Pickup */}
                <div className="flex items-center gap-2 mb-4">
                    {item.deliveryAvailable && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            <Truck className="w-3 h-3" /> Delivery
                        </span>
                    )}
                    {item.pickupAvailable && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <Package className="w-3 h-3" /> Pickup
                        </span>
                    )}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <span className="text-2xl font-bold text-gray-900">{item.minPriceFormatted?.replace('$', '₹')}</span>
                        <span className="text-xs text-gray-400 font-bold uppercase ml-1">/{item.priceUnit}</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/item/${item.id}/shops`); }}
                        className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
