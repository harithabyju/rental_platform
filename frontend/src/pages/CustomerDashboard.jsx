import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import DashboardCard from '../components/DashboardCard';
import SearchBar from '../components/SearchBar';
import { Package, CheckCircle, CreditCard, Calendar, Search, ArrowRight, TrendingUp, IndianRupee } from 'lucide-react';

const CATEGORY_ICONS = {
    'vehicles': '🚗',
    'event-items': '🎪',
    'costumes': '👗',
    'tools-construction': '🔨',
    'electronics': '📷',
    'furniture': '🛋️',
    'sports-fitness': '🚴',
    'party-celebrations': '🎵',
};

const CustomerDashboard = () => {
    const { user } = useAuth();
    const { summary, categories, summaryLoading, categoriesLoading, fetchSummary, fetchCategories } = useDashboard();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSummary();
        fetchCategories();
    }, []);

    const handleSearch = (q) => {
        setSearchQuery(q);
        if (q.trim()) {
            navigate(`/dashboard/browse?q=${encodeURIComponent(q.trim())}`);
        }
    };

    const handleCategoryClick = (cat) => {
        navigate(`/dashboard/browse?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`);
    };

    const quickActions = [
        { label: 'Search Items', desc: 'Browse available rentals', icon: Search, path: '/dashboard/browse', color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        { label: 'My Bookings', desc: 'View rental history', icon: Calendar, path: '/dashboard/bookings', color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        { label: 'Payments', desc: 'Manage payment records', icon: CreditCard, path: '/dashboard/payments', color: 'bg-amber-50', iconColor: 'text-amber-600' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 sm:p-12 text-white shadow-2xl shadow-emerald-100 group">
                {/* Decorative floating blobs */}
                <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] left-[-5%] w-60 h-60 bg-emerald-400/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }} />
                <div className="absolute top-[20%] left-[40%] w-32 h-32 bg-teal-400/10 rounded-full blur-2xl animate-pulse-subtle" />

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight flex flex-wrap items-center gap-x-3">
                        <span className="animate-slide-up inline-block" style={{ animationDelay: '0.1s' }}>Namaste,</span>
                        <span className="animate-slide-up inline-block text-emerald-200" style={{ animationDelay: '0.3s' }}>
                            {user?.fullname?.split(' ')[0]}!
                        </span>
                        <span className="animate-bounce inline-block origin-bottom" style={{ animationDelay: '0.6s' }}>👋</span>
                    </h1>
                    <p className="text-emerald-50 text-lg mb-8 font-medium animate-slide-up" style={{ animationDelay: '0.5s' }}>
                        Premium rentals for your next adventure. <span className="text-emerald-300 font-bold">Discover Local. Rent Smart.</span>
                    </p>

                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.7s' }}>
                        <div className="flex-1 transition-all focus-within:scale-[1.01]">
                            <SearchBar
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search cameras, bikes, camping gear..."
                                className="w-full text-gray-900 h-14 shadow-2xl shadow-emerald-900/20"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/browse')}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-emerald-700 hover:bg-emerald-50 font-black rounded-2xl transition-all shadow-xl active:scale-95 group/btn hover-tilt active-press active-pop"
                        >
                            <TrendingUp className="w-5 h-5 group-hover/btn:translate-y-[-2px] transition-transform" />
                            <span>Explorer</span>
                        </button>
                    </div>
                </div>
            </div>


            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {summaryLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-white border border-gray-100 rounded-3xl animate-pulse" />
                    ))
                ) : (
                    <>
                        <DashboardCard
                            label="Active Rentals"
                            value={summary?.activeRentals ?? 0}
                            icon={Package}
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                            trend="Items in your care"
                        />
                        <DashboardCard
                            label="Completed"
                            value={summary?.completedRentals ?? 0}
                            icon={CheckCircle}
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                            trend="Successfully returned"
                        />
                        <DashboardCard
                            label="Lifetime Savings"
                            value={summary?.totalSpentFormatted?.replace('$', '₹') || '₹0.00'}
                            icon={IndianRupee}
                            iconBg="bg-amber-50"
                            iconColor="text-amber-600"
                            trend="Rent vs Buy impact"
                        />
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl font-bold text-gray-900 mb-5 pl-1">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {quickActions.map((action) => (
                        <button
                            key={action.path}
                            onClick={() => navigate(action.path)}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 text-left group border-b-4 border-b-transparent hover:border-b-emerald-500 hover-tilt active-press active-pop"
                        >
                            <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm`}>
                                <action.icon className={`w-7 h-7 ${action.iconColor}`} />
                            </div>
                            <p className="font-bold text-gray-900 text-lg">{action.label}</p>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{action.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Browse by Category */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-6 pl-1">
                    <h2 className="text-xl font-bold text-gray-900">Explore by Category</h2>
                    <button
                        onClick={() => navigate('/dashboard/browse')}
                        className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-bold transition-colors bg-emerald-50 px-4 py-2 rounded-xl"
                    >
                        View all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {categoriesLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-28 bg-white border border-gray-100 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat)}
                                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 text-center group hover-tilt active-press active-pop"
                            >
                                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                                    {CATEGORY_ICONS[cat.slug] || '📦'}
                                </div>
                                <p className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors">
                                    {cat.name}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
