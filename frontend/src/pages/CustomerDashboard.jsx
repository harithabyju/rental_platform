import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import * as dashboardService from '../services/dashboardService';
import searchService from '../services/searchService';
import CategoryDropdown from '../components/CategoryDropdown';
import DateRangePicker from '../components/DateRangePicker';
import RadiusSlider from '../components/RadiusSlider';
import SearchResultsGrid from '../components/SearchResultsGrid';
import SortDropdown from '../components/SortDropdown';
import RentalStatusCard from '../components/RentalStatusCard';
import { Search, Map as MapIcon, Grid, SlidersHorizontal, MapPin, Package, CheckCircle, Wallet, ArrowRight, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { categories, fetchCategories, summary, fetchSummary } = useDashboard();
    const [activeRentals, setActiveRentals] = useState([]);
    const [nearbyShops, setNearbyShops] = useState([]);
    const [rentalsLoading, setRentalsLoading] = useState(false);
    const [shopsLoading, setShopsLoading] = useState(false);

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
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchSummary();
        loadActiveRentals();

        // Auto-load items with broader discovery if location is available
        const autoSearch = async () => {
            const defaultParams = {
                ...searchParams,
                radius: 100, // Broaden initial discovery
                category: '' // Show all categories
            };
            try {
                const data = await searchService.searchItems(defaultParams);
                setResults(data.items.slice(0, 8)); // Show a teaser of 8 items
                setPagination(data.pagination);
                setHasSearched(true);
            } catch (err) {
                console.error('Initial search failed:', err);
            }
        };

        autoSearch();

        if (navigator.geolocation && !user?.latitude) {
            navigator.geolocation.getCurrentPosition((position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setSearchParams(prev => ({
                    ...prev,
                    ...coords
                }));
                // Re-trigger search with new coordinates
                searchService.searchItems({ ...searchParams, ...coords, radius: 100 })
                    .then(data => setResults(data.items.slice(0, 8)));
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
        if (e && e.preventDefault) e.preventDefault();

        // If searching from the Welcome Board main bar (not in Explorer mode), 
        // we might want to navigate to the Browse page if it's a new searching action
        if (!showExplorer && e) {
            navigate(`/dashboard/browse?q=${encodeURIComponent(searchParams.q)}`);
            return;
        }

        setLoading(true);
        if (e) setHasSearched(true);
        try {
            const data = await searchService.searchItems(searchParams);

            setResults(data.items);
            setPagination(data.pagination);

            // Scroll to results only if user explicitly searched
            if (e) {
                const resultsSection = document.getElementById('search-results');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth' });
                }
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
        if (hasSearched && (searchParams.sort || searchParams.page)) {
            handleSearch();
        }
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

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchParams.q.trim()) {
                                navigate(`/dashboard/browse?q=${encodeURIComponent(searchParams.q)}`);
                            }
                        }}
                        className="flex flex-col sm:flex-row gap-4 max-w-4xl animate-slide-up"
                        style={{ animationDelay: '0.2s' }}
                    >
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
                                type="button"
                                onClick={() => {
                                    setShowExplorer(!showExplorer);
                                    if (!showExplorer) {
                                        // Scroll to explorer section
                                        setTimeout(() => {
                                            document.getElementById('explorer-section')?.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    }
                                }}
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

            {/* Popular Categories */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900 px-2">Popular Categories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => navigate(`/dashboard/browse?categoryId=${cat.id}`)}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group flex flex-col items-center gap-3 active-press hover-tilt"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl group-hover:bg-emerald-600 group-hover:scale-110 transition-all">
                                {getCategoryIcon(cat.slug)}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-emerald-700 transition-colors text-center">
                                {cat.name}
                            </span>
                        </button>
                    ))}
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



            {/* Active Bookings Section */}
            {activeRentals.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-gray-900">Active Rentals</h3>
                            <p className="text-gray-500 text-sm font-medium">Currently ongoing rentals that you are using.</p>
                        </div>
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
                            <h2 className="text-3xl font-black text-emerald-900 flex items-center gap-3">
                                <MapPin className="text-emerald-500" size={32} /> Location-Based Explorer
                            </h2>
                            <p className="text-gray-500 font-medium text-lg">Find precisely what's available near you right now.</p>
                        </div>
                        <button onClick={() => setShowExplorer(false)} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all font-black">&times;</button>
                    </div>



                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10 items-end">
                        <CategoryDropdown
                            categories={categories}
                            value={searchParams.category}
                            onChange={(val) => setSearchParams(prev => ({ ...prev, category: val }))}
                        />
                        <div className="lg:col-span-2">
                            <DateRangePicker
                                startDate={searchParams.start_date}
                                endDate={searchParams.end_date}
                                onStartChange={(val) => setSearchParams(prev => ({ ...prev, start_date: val }))}
                                onEndChange={(val) => setSearchParams(prev => ({ ...prev, end_date: val }))}
                            />
                        </div>
                        <RadiusSlider
                            value={searchParams.radius}
                            onChange={(val) => setSearchParams(prev => ({ ...prev, radius: val }))}
                        />
                        <div className="lg:col-span-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-16 px-12 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-200 disabled:opacity-50 active-press hover-tilt"
                            >
                                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search size={24} />}
                                Find Items Now
                            </button>
                        </div>
                    </form>


                </div>
            )}

            {/* Content Results Section */}
            <div id="search-results" className="space-y-8 pt-12 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                            Explore Catalog
                        </h2>
                        <p className="text-gray-500 font-medium">
                            {hasSearched ? 'Latest items from verified neighborhood shops.' : 'Discovering items near you...'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-2xl">
                        <SortDropdown value={searchParams.sort} onChange={handleSortChange} />
                        <button
                            onClick={() => navigate('/dashboard/browse')}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                        >
                            Browse All
                        </button>
                    </div>
                </div>

                <div className="min-h-[400px]">
                    <SearchResultsGrid items={results} loading={loading} />

                    {!loading && results.length === 0 && (
                        <div className="h-[400px] rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm mb-4">
                                <Search size={24} />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">No items found yet</h4>
                            <p className="text-sm text-gray-500 max-w-xs mb-4">
                                We couldn't find anything matching your exact location. Try broadening your radius in the Explorer.
                            </p>
                            <button
                                onClick={() => setShowExplorer(true)}
                                className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline"
                            >
                                Open Explorer
                            </button>
                        </div>
                    )}

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
