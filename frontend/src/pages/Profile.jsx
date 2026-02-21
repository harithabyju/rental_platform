import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, ArrowLeft, Star, Heart, Store, History, Package, Trophy, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as dashboardService from '../services/dashboardService';
import authService from '../services/authService';
import GoogleMapLocationSelector from '../components/GoogleMapLocationSelector';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingLocation, setSavingLocation] = useState(false);
    const [location, setLocation] = useState({
        lat: user?.latitude || 28.6139,
        lng: user?.longitude || 77.2090
    });

    const handleSaveLocation = async () => {
        setSavingLocation(true);
        try {
            const updatedUser = await authService.updateUser({
                latitude: location.lat,
                longitude: location.lng
            });
            updateUser(updatedUser);
            toast.success('Primary location updated successfully!');
        } catch (err) {
            toast.error('Failed to update location');
        } finally {
            setSavingLocation(false);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await dashboardService.getProfileStats();
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (!user) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-8 font-black transition-all group hover-tilt active-press active-pop"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Identity Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card p-8 text-center animate-scale-up">
                        <div className="relative inline-block mb-6">
                            <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-emerald-100 hover:rotate-3 transition-transform cursor-default">
                                {user.fullname.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border-4 border-emerald-50 flex items-center justify-center text-emerald-600">
                                <Shield size={18} fill="currentColor" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">{user.fullname}</h1>
                        <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px] bg-emerald-50 inline-block px-3 py-1 rounded-lg mt-3 border border-emerald-100 italic">
                            {user.role?.replace('_', ' ')} Partner
                        </p>

                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                <Mail size={16} className="text-gray-400" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                <History size={16} className="text-gray-400" />
                                <span>Member since 2024</span>
                            </div>
                        </div>
                    </div>

                    {/* Safety Badge */}
                    <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <Trophy className="text-amber-400 w-6 h-6" />
                            <h3 className="font-black text-sm uppercase tracking-widest">Trust Level</h3>
                        </div>
                        <p className="text-4xl font-black text-emerald-400 mb-2">GOLD</p>
                        <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-tighter">Verified transactions and professional community standing.</p>
                    </div>
                </div>

                {/* Personalized Stats Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Insights Greeting */}
                    <div className="animate-slide-up">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Your Rental Lens</h2>
                        <p className="text-gray-500 font-medium">Discover your patterns and favorite treasures on Grab'N'Go.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Interests / Categories */}
                        <div className="card p-6 border-none shadow-xl shadow-gray-100 bg-white animate-slide-up hover-tilt" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <Star className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">Core Interests</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {stats?.topCategories?.length > 0 ? (
                                    stats.topCategories.map((cat, idx) => (
                                        <span key={cat.id} className={`px-4 py-2 rounded-2xl text-xs font-black transition-all hover:scale-105 cursor-default ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                                            }`}>
                                            {cat.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-xs italic font-medium">No rentals quite yet...</p>
                                )}
                            </div>
                        </div>

                        {/* Favorite Shop */}
                        <div className="card p-6 border-none shadow-xl shadow-gray-100 bg-white animate-slide-up hover-tilt" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-50 rounded-xl">
                                    <Store className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">Partner of Choice</h3>
                            </div>
                            {stats?.favoriteShop ? (
                                <div>
                                    <p className="text-xl font-black text-gray-900">{stats.favoriteShop.name}</p>
                                    <p className="text-xs text-amber-600 font-bold mt-1 uppercase tracking-tighter">Your #1 Most Visited Shop</p>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-xs italic font-medium">Explore local shops soon!</p>
                            )}
                        </div>
                    </div>

                    {/* Featured Top Rental */}
                    <div className="card p-8 overflow-hidden group border-none shadow-2xl shadow-emerald-50 bg-gradient-to-br from-white to-emerald-50/30 animate-slide-up hover-tilt" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-rose-50 rounded-xl">
                                <Heart className="w-5 h-5 text-rose-500" />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">Your Trusted Companion</h3>
                        </div>

                        {stats?.topItem ? (
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-4 border-white flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                    <img src={stats.topItem.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'} alt={stats.topItem.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-1">Most Rented Item</p>
                                    <h4 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-3">{stats.topItem.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-sm font-bold text-gray-600">Rented <span className="text-emerald-600">{stats.topItem.rentalCount} times</span></p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/browse')}
                                    className="ml-auto hidden md:flex w-14 h-14 bg-gray-900 rounded-2xl items-center justify-center text-white hover:bg-emerald-600 transition-all active:scale-90 hover-tilt active-press active-pop"
                                >
                                    <Package size={24} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-400 font-medium italic">Your most rented item will appear here.</p>
                                <button
                                    onClick={() => navigate('/dashboard/browse')}
                                    className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-4 hover:underline"
                                >
                                    Start Browsing →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Location Specification Card */}
                    <div className="card p-8 border-none shadow-2xl shadow-emerald-50 bg-white animate-slide-up" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-xl">
                                    <MapPin className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">Base of Operations</h3>
                            </div>
                            <button
                                onClick={handleSaveLocation}
                                disabled={savingLocation || (location.lat === user.latitude && location.lng === user.longitude)}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale transition-all active-press"
                            >
                                {savingLocation ? 'Updating...' : 'Save Location'}
                            </button>
                        </div>

                        <div className="rounded-[2rem] overflow-hidden border-2 border-emerald-50">
                            <GoogleMapLocationSelector
                                lat={location.lat}
                                lng={location.lng}
                                radius={5} // Default radius for profile view
                                onLocationChange={(lat, lng) => setLocation({ lat, lng })}
                            />
                        </div>
                        <p className="mt-4 text-[10px] items-center gap-1.5 font-bold text-gray-400 uppercase tracking-widest flex">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            This location will be used to prioritize nearby rentals and estimate delivery costs.
                        </p>
                    </div>

                    {/* Support Box */}
                    <div className="text-center py-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        <p className="text-sm font-medium text-gray-400">
                            Looking to change your profile details?
                            <a href="mailto:help@grabngo.in" className="text-emerald-600 font-black ml-1 hover:underline tracking-tighter">Connect with Elite Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
