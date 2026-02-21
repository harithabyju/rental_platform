import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import * as dashboardService from '../services/dashboardService';
import searchService from '../services/searchService';
import CategoryDropdown from '../components/CategoryDropdown';
import DateRangePicker from '../components/DateRangePicker';
import GoogleMapLocationSelector from '../components/GoogleMapLocationSelector';
import RadiusSlider from '../components/RadiusSlider';
import SearchResultsGrid from '../components/SearchResultsGrid';
import SortDropdown from '../components/SortDropdown';
import RentalStatusCard from '../components/RentalStatusCard';
import TechnicalInsights from '../components/TechnicalInsights';
import { Search, Map as MapIcon, Grid, SlidersHorizontal, MapPin, Package, CheckCircle, Wallet, ArrowRight, ChevronRight, Info } from 'lucide-react';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { categories, fetchCategories, summary, fetchSummary } = useDashboard();
    const [activeRentals, setActiveRentals] = useState([]);
    const [rentalsLoading, setRentalsLoading] = useState(false);

    // Search State
    const [searchParams, setSearchParams] = useState({
        category: '',
        lat: user?.latitude || 28.6139,
        lng: user?.longitude || 77.2090,
        radius: 10,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        sort: 'distance',
        page: 1,
        limit: 12,
        q: ''
    });

    const [results, setResults] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showExplorer, setShowExplorer] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchSummary();
        loadActiveRentals();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setSearchParams(prev => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
            });
        }
    }, [fetchCategories, fetchSummary]);

    const loadActiveRentals = async () => {
        setRentalsLoading(true);
        try {
            const res = await dashboardService.getActiveRentals();
            setActiveRentals(res.data.slice(0, 3)); // Only show top 3 on dashboard
        } catch (error) {
            console.error('Failed to load active rentals:', error);
        } finally {
            setRentalsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        try {
            const data = showExplorer
                ? await searchService.searchItems(searchParams)
                : await dashboardService.searchItems({
                    q: searchParams.q,
                    categoryId: searchParams.category,
                    page: searchParams.page,
                    pageSize: searchParams.limit
                });

            setResults(data.items);
            setPagination(data.pagination);

            // Scroll to results
            const resultsSection = document.getElementById('search-results');
            if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationChange = (lat, lng) => {
        setSearchParams(prev => ({ ...prev, lat, lng }));
    };

    const handleSortChange = (sort) => {
        setSearchParams(prev => ({ ...prev, sort }));
    };

    const getCategoryIcon = (slug) => {
        const icons = {
            'vehicles': '🚗',
            'cameras': '📸',
            'electronics': '💻',
            'tools': '🔨',
            'camping': '⛺',
            'event-items': '🎪',
            'costumes': '👗',
        };
        return icons[slug] || '📦';
    };

    useEffect(() => {
        if (hasSearched) handleSearch();
    }, [searchParams.sort, searchParams.page]);

    useEffect(() => {
        if (location.state?.autoOpenExplorer) {
            setShowExplorer(true);
            // Scroll to explorer
            setTimeout(() => {
                const explorerSection = document.getElementById('explorer-section');
                if (explorerSection) explorerSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [location.state]);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in px-4 sm:px-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1a5d3d] p-8 sm:p-14 text-white shadow-2xl animate-scale-up">
                <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl sm:text-6xl font-black flex items-center gap-4">
                                Namaste, {user?.fullname?.split(' ')[0] || 'User'}! <span className="animate-wave inline-block">👋</span>
                            </h1>
                            <div className="bg-emerald-400/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-400/30 flex items-center gap-2 animate-bounce-subtle">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
                                    {searchParams.lat.toFixed(2)}, {searchParams.lng.toFixed(2)} detected
                                </span>
                            </div>
                        </div>
                        <p className="text-emerald-50 text-xl sm:text-2xl font-medium opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Premium rentals for your next adventure. <span className="text-emerald-300">Discover Local. Rent Smart.</span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 max-w-4xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="relative flex-grow group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 transition-colors group-focus-within:text-emerald-500" size={24} />
                            <input
                                type="text"
                                placeholder="Search cameras, bikes, camping gear..."
                                value={searchParams.q}
                                onChange={(e) => setSearchParams(prev => ({ ...prev, q: e.target.value }))}
                                className="w-full h-16 pl-16 pr-6 rounded-2xl bg-white text-gray-900 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-emerald-400/30 transition-all placeholder:text-gray-400 shadow-xl"
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowExplorer(!showExplorer)}
                                className={`h-16 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl active-press hover-tilt relative ${showExplorer
                                    ? 'bg-emerald-300 text-emerald-900 ring-4 ring-emerald-300/30'
                                    : 'bg-emerald-50 text-emerald-900 border-2 border-transparent hover:bg-white'
                                    }`}
                            >
                                <MapIcon size={22} />
                                Explorer
                                {!showExplorer && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
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
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Active Rentals</p>
                        <h4 className="text-3xl font-black text-gray-900">{summary?.activeRentals || 0}</h4>
                    </div>
                </div>

                <div className="glass-morphic p-8 rounded-3xl flex items-center gap-6 hover:shadow-2xl transition-all group hover-tilt animate-slide-up delay-200">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50/50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Completed</p>
                        <h4 className="text-3xl font-black text-gray-900">{summary?.completedRentals || 0}</h4>
                    </div>
                </div>

                <div className="glass-morphic p-8 rounded-3xl flex items-center gap-6 hover:shadow-2xl transition-all group hover-tilt animate-slide-up delay-300">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50/50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                        <Wallet size={32} />
                    </div>
                    <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Total Spent</p>
                        <h4 className="text-3xl font-black text-gray-900">{summary?.totalSpentFormatted || '₹0.00'}</h4>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900 px-2">Quick Actions</h3>
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

            {/* Browse by Category */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-gray-900">Browse by Category</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {categories.slice(0, 4).map((cat, i) => (
                        <button
                            key={cat.id}
                            onClick={() => navigate(`/dashboard/browse?category=${cat.id}`)}
                            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all text-center group active-press hover-tilt animate-slide-up"
                            style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                        >
                            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{getCategoryIcon(cat.slug)}</div>
                            <span className="font-bold text-gray-700 block text-sm">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Bookings Section */}
            {activeRentals.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black text-gray-900">Active Bookings</h3>
                        <button onClick={() => navigate('/dashboard/rentals')} className="text-blue-600 text-sm font-black flex items-center gap-1 hover:gap-2 transition-all">
                            View All <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {activeRentals.map((rental) => (
                            <RentalStatusCard key={rental.rentalId} rental={rental} />
                        ))}
                    </div>
                </div>
            )}

            {/* Explorer Section */}
            {showExplorer && (
                <div id="explorer-section" className="bg-white rounded-[2.5rem] shadow-2xl border border-emerald-100 p-8 sm:p-12 animate-slide-up space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <h2 className="text-3xl font-black text-emerald-900 flex items-center gap-3">
                                    <MapPin className="text-emerald-500" size={32} /> Location-Based Explorer
                                </h2>
                                <button
                                    onClick={() => setShowInsights(!showInsights)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 ${showInsights
                                        ? 'bg-emerald-600 text-white shadow-lg'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        }`}
                                >
                                    <Info size={14} /> {showInsights ? 'Hide Logic' : 'How it works?'}
                                </button>
                            </div>
                            <p className="text-gray-500 font-medium text-lg">Find precisely what's available near you right now.</p>
                        </div>
                        <button onClick={() => setShowExplorer(false)} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all font-black">&times;</button>
                    </div>

                    {showInsights && (
                        <TechnicalInsights onClose={() => setShowInsights(false)} />
                    )}

                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
                        <CategoryDropdown
                            categories={categories}
                            value={searchParams.category}
                            onChange={(val) => setSearchParams(prev => ({ ...prev, category: val }))}
                        />
                        <DateRangePicker
                            startDate={searchParams.start_date}
                            endDate={searchParams.end_date}
                            onStartChange={(val) => setSearchParams(prev => ({ ...prev, start_date: val }))}
                            onEndChange={(val) => setSearchParams(prev => ({ ...prev, end_date: val }))}
                        />
                        <RadiusSlider
                            value={searchParams.radius}
                            onChange={(val) => setSearchParams(prev => ({ ...prev, radius: val }))}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-14 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 active-press hover-tilt"
                        >
                            {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search size={22} />}
                            Find Items
                        </button>
                    </form>

                    <div className="rounded-3xl overflow-hidden border-4 border-emerald-50 shadow-inner">
                        <GoogleMapLocationSelector
                            lat={searchParams.lat}
                            lng={searchParams.lng}
                            radius={searchParams.radius}
                            onLocationChange={handleLocationChange}
                        />
                    </div>
                </div>
            )}

            {/* Content Results Section */}
            <div id="search-results" className="space-y-8 pt-12 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                            {hasSearched ? `Search Results (${pagination?.total || 0})` : 'Popular Rentals Nearby'}
                        </h2>
                        <p className="text-gray-500 font-medium">Hand-picked rentals just for you.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-2xl">
                        <SortDropdown value={searchParams.sort} onChange={handleSortChange} />
                    </div>
                </div>

                <div className="min-h-[400px]">
                    <SearchResultsGrid items={results} loading={loading} />

                    {pagination && pagination.pages > 1 && (
                        <div className="mt-16 flex justify-center gap-3">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setSearchParams(prev => ({ ...prev, page: i + 1 }))}
                                    className={`w-14 h-14 rounded-2xl font-black transition-all shadow-sm ${searchParams.page === i + 1
                                        ? 'bg-[#1a5d3d] text-white shadow-[#1a5d3d]/20 scale-110'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
