import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as dashboardService from '../services/dashboardService';
import RatingDisplay from '../components/RatingDisplay';
import { MapPin, Truck, Package, ArrowLeft, ShieldCheck, Info } from 'lucide-react';

const ItemShops = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [shops, setShops] = useState([]);
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShopAvailability = async () => {
            setLoading(true);
            try {
                const res = await dashboardService.getShopsForItem(itemId);
                setShops(res.data);
                if (res.data.length > 0) {
                    setItem(res.data[0].item);
                } else {
                    setError('This item is currently not available in any shops.');
                }
            } catch (err) {
                setError('Failed to load availability data.');
            } finally {
                setLoading(false);
            }
        };

        fetchShopAvailability();
    }, [itemId]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-8">
                <div className="h-80 bg-white border border-gray-100 rounded-[2rem]" />
                <div className="h-10 bg-gray-100 w-1/3 rounded-xl" />
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-40 bg-white border border-gray-100 rounded-[2rem]" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-24 text-center animate-scale-up">
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Info className="w-12 h-12 text-amber-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Stock Alert!</h2>
                <p className="text-gray-500 font-medium mb-10 text-lg">{error}</p>
                <button
                    onClick={() => navigate('/dashboard/browse')}
                    className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                    Browse Other Treasures
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            {/* Header / Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-10 font-black transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
            </button>

            {/* Item Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
                <div className="aspect-[4/5] sm:aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200 border-8 border-white bg-white animate-scale-up">
                    <img
                        src={item?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                        alt={item?.name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                </div>
                <div className="flex flex-col animate-slide-up">
                    <div className="inline-flex mb-4">
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            Verified Rental Item
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">{item?.name}</h1>
                    <div className="mb-6">
                        <RatingDisplay rating={item?.rating} totalReviews={item?.totalReviews} size="md" />
                    </div>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">
                        {item?.description}
                    </p>
                    <div className="flex items-center gap-5 p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-[2rem] border border-emerald-100/50">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-emerald-900">Rental Assurance</p>
                            <p className="text-xs text-emerald-700 font-medium">Original parts, professional maintenance & sanitized before delivery.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Availability List */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Select a Shop</h2>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{shops.length} options available</span>
                </div>
                <div className="space-y-6">
                    {shops.map((shop) => (
                        <div key={shop.shopId} className="card p-8 group border-2 border-transparent hover:border-emerald-500 transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <h3 className="font-black text-gray-900 text-2xl group-hover:text-emerald-600 transition-colors">
                                            {shop.shopName}
                                        </h3>
                                        <div className="h-6 w-px bg-gray-200" />
                                        <RatingDisplay rating={shop.shopRating} totalReviews={shop.shopReviews} />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-500 mb-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                            <span>{shop.location.city} Shop</span>
                                        </div>
                                        {shop.deliveryAvailable && (
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Truck className="w-4 h-4" />
                                                <span>Express Delivery (₹{shop.deliveryFee})</span>
                                            </div>
                                        )}
                                        {shop.pickupAvailable && (
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <Package className="w-4 h-4" />
                                                <span>Self-Pickup Ready</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:bg-emerald-50 transition-colors">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        {shop.quantityAvailable} units ready to rent
                                    </div>
                                </div>

                                <div className="flex items-center gap-10 md:border-l border-gray-100 md:pl-10">
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-emerald-600">₹{shop.priceFormatted?.replace('$', '')?.replace('₹', '')}</p>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">per {shop.priceUnit}</p>
                                    </div>
                                    <Link
                                        to={`/book/${itemId}?shopId=${shop.shopId}`}
                                        className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-emerald-600 shadow-2xl shadow-gray-200 transition-all active:scale-95 group-hover:shadow-emerald-100"
                                    >
                                        Reserve
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ItemShops;
