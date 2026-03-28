import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { Search, Grid, Package, CheckCircle, Wallet, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { categories, fetchCategories, summary, fetchSummary } = useDashboard();
    const scrollRef = useRef(null);
    const [swiperInstance, setSwiperInstance] = useState(null);

    // Default search params
    const [localSearchParams, setLocalSearchParams] = useState({
        lat: user?.latitude ? parseFloat(user.latitude) : 28.6139,
        lng: user?.longitude ? parseFloat(user.longitude) : 77.2090,
        q: ''
    });

    useEffect(() => {
        fetchCategories();
        fetchSummary();
    }, [fetchCategories, fetchSummary]);

    const getCategoryIcon = (slug) => {
        const slugLower = slug?.toLowerCase() || '';
        if (slugLower.includes('vehicle') || slugLower.includes('car') || slugLower.includes('bike')) return '🚗';
        if (slugLower.includes('camera') || slugLower.includes('lens') || slugLower.includes('photo')) return '📸';
        if (slugLower.includes('electronic') || slugLower.includes('laptop') || slugLower.includes('computer')) return '💻';
        if (slugLower.includes('tool') || slugLower.includes('drill') || slugLower.includes('hardware')) return '🔨';
        if (slugLower.includes('camp') || slugLower.includes('tent') || slugLower.includes('outdoor')) return '⛺';
        if (slugLower.includes('event') || slugLower.includes('party') || slugLower.includes('wedding')) return '🎪';
        if (slugLower.includes('costume') || slugLower.includes('clothes') || slugLower.includes('apparel')) return '👗';
        if (slugLower.includes('game') || slugLower.includes('console') || slugLower.includes('play')) return '🎮';
        if (slugLower.includes('sport') || slugLower.includes('fitness') || slugLower.includes('gym')) return '⚽';
        if (slugLower.includes('music') || slugLower.includes('instrument') || slugLower.includes('audio')) return '🎸';
        if (slugLower.includes('book') || slugLower.includes('study') || slugLower.includes('education')) return '📚';
        if (slugLower.includes('appliances') || slugLower.includes('home')) return '🏠';
        if (slugLower.includes('furniture')) return '🪑';
        if (slugLower.includes('toy') || slugLower.includes('kid')) return '🧸';
        return '📦';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in px-4 sm:px-6">
            <style>{`
                /* Modern Gradients & Glassmorphism */
                .glass-morphic {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                }
                .dark .glass-morphic {
                    background: rgba(17, 24, 39, 0.4);
                    border-color: rgba(255, 255, 255, 0.05);
                }
                
                /* Swiper Customizations */
                .category-swiper {
                    padding: 3rem 1rem 5rem 1rem !important;
                }
                .category-swiper .swiper-slide {
                    width: 240px;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: auto;
                }
                .category-swiper .swiper-slide:not(.swiper-slide-active) {
                    filter: blur(8px) grayscale(0.5);
                    opacity: 0.4;
                    transform: scale(0.8);
                }
                .category-swiper .swiper-slide-active {
                    filter: blur(0px);
                    opacity: 1;
                    z-index: 10;
                    transform: scale(1.2) translateY(-20px);
                }
                
                /* Animations */
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .hover-tilt:hover {
                    transform: perspective(1000px) rotateX(2deg) rotateY(2deg) scale(1.02);
                }
            `}</style>
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1a5d3d] p-8 sm:p-14 text-white shadow-2xl animate-scale-up">
                <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl sm:text-6xl font-black flex items-center gap-4">
                                Namaste, {user?.fullname?.split(' ')[0] || 'User'}! <span className="animate-wave inline-block">👋</span>
                            </h1>
                        </div>
                        <p className="text-emerald-50 text-xl sm:text-2xl font-medium opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Premium rentals for your next adventure. <span className="text-emerald-300">Discover Local. Rent Smart.</span>
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const params = new URLSearchParams();
                            if (localSearchParams.q.trim()) params.append('q', localSearchParams.q);
                            if (localSearchParams.lat) params.append('lat', localSearchParams.lat);
                            if (localSearchParams.lng) params.append('lng', localSearchParams.lng);
                            navigate(`/dashboard/browse?${params.toString()}`);
                        }}
                        className="flex flex-col sm:flex-row gap-4 max-w-5xl animate-slide-up bg-white/10 backdrop-blur-xl p-3 rounded-[2rem] border border-white/20 shadow-2xl"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <div className="relative flex-grow group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400 opacity-70 transition-colors group-focus-within:text-white" size={24} />
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                value={localSearchParams.q}
                                onChange={(e) => setLocalSearchParams(prev => ({ ...prev, q: e.target.value }))}
                                className="w-full h-14 pl-16 pr-6 rounded-2xl bg-white/5 text-white text-lg font-medium focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/40"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 border border-white/10">
                            <MapPin className="text-emerald-400 w-5 h-5" />
                            <span className="text-sm font-bold text-white/80 whitespace-nowrap">
                                Nearby You
                            </span>
                        </div>
                        <button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-emerald-900/50 hover:scale-[1.02] active:scale-95 h-14"
                        >
                            Find Now
                        </button>
                    </form>
                </div>

                <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-400 rounded-full blur-[100px] animate-float"></div>
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-300 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1s' }}></div>
                </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-morphic p-8 rounded-3xl flex items-center gap-6 hover:shadow-2xl transition-all group hover-tilt animate-slide-up delay-100">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50/50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                        <Package size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Active Rentals</p>
                        <h4 className="text-3xl font-black text-gray-900 dark:text-gray-100">{summary?.activeRentals || 0}</h4>
                    </div>
                </div>

                <div className="glass-morphic p-8 rounded-3xl flex items-center gap-6 hover:shadow-2xl transition-all group hover-tilt animate-slide-up delay-200">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50/50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Completed</p>
                        <h4 className="text-3xl font-black text-gray-900 dark:text-gray-100">{summary?.completedRentals || 0}</h4>
                    </div>
                </div>

                <div className="glass-morphic p-8 rounded-3xl flex items-center gap-6 hover:shadow-2xl transition-all group hover-tilt animate-slide-up delay-300">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50/50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                        <Wallet size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Total Spent</p>
                        <h4 className="text-3xl font-black text-gray-900 dark:text-gray-100">{summary?.totalSpentFormatted || '₹0.00'}</h4>
                    </div>
                </div>
            </div>

            {/* Popular Categories */}
            <div className="space-y-6 relative group/slider">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">Popular Categories</h3>
                </div>
                
                <div className="relative -mx-4 sm:mx-0">
                    {categories.length > 0 && (
                        <Swiper
                            onSwiper={setSwiperInstance}
                            initialSlide={Math.max(0, Math.floor(categories.length / 2))}
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            slidesPerView={'auto'}
                            coverflowEffect={{
                                rotate: 0,
                                stretch: 0,
                                depth: 100,
                                modifier: 2.5,
                                slideShadows: false, // We use custom background/shadows on cards instead
                            }}
                            navigation={true}
                            modules={[EffectCoverflow, Navigation]}
                            className="category-swiper"
                        >
                            {categories.map((cat, index) => (
                                <SwiperSlide key={cat.id} onMouseEnter={() => swiperInstance?.slideTo(index)}>
                                    <button
                                        onClick={() => navigate(`/dashboard/browse?categoryId=${cat.id}`)}
                                        className="w-full h-full bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800/60 shadow-xl flex flex-col items-center justify-center gap-4 transition-all"
                                    >
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-4xl shadow-inner group-hover:bg-emerald-600 transition-all">
                                            {getCategoryIcon(cat.slug)}
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 text-center">
                                            {cat.name}
                                        </span>
                                    </button>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 px-2">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <button
                        onClick={() => navigate('/dashboard/browse')}
                        className="glass-card px-8 py-10 rounded-3xl border border-white/40 hover:shadow-2xl transition-all text-left group active-press hover-tilt"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Search size={28} />
                        </div>
                        <h5 className="text-xl font-bold mb-2">Search Items</h5>
                        <p className="text-gray-500 text-sm font-medium">Browse available rentals</p>
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/bookings')}
                        className="glass-card px-8 py-10 rounded-3xl border border-white/40 hover:shadow-2xl transition-all text-left group active-press hover-tilt"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Grid size={28} />
                        </div>
                        <h5 className="text-xl font-bold mb-2">My Bookings</h5>
                        <p className="text-gray-500 text-sm font-medium">View rental history</p>
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/payments')}
                        className="glass-card px-8 py-10 rounded-3xl border border-white/40 hover:shadow-2xl transition-all text-left group active-press hover-tilt"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Wallet size={28} />
                        </div>
                        <h5 className="text-xl font-bold mb-2">Payments</h5>
                        <p className="text-gray-500 text-sm font-medium">Manage payment methods</p>
                    </button>
                </div>
            </div>



        </div>
    );
};

export default CustomerDashboard;
