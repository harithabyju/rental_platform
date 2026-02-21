import React, { useEffect, useState } from 'react';
import { getMyBookings } from '../services/bookingService';
import BookingCard from '../components/BookingCard';
import { Calendar, Search, ArrowLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Active');
    const navigate = useNavigate();

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await getMyBookings();
            setBookings(data);
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const status = booking.status?.toLowerCase();
        if (activeTab === 'Active') return status === 'confirmed' || status === 'active';
        if (activeTab === 'Completed') return status === 'completed' || status === 'returned';
        if (activeTab === 'Cancelled') return status === 'cancelled';
        return true;
    });

    const getCount = (tab) => {
        return bookings.filter(b => {
            const s = b.status?.toLowerCase();
            if (tab === 'Active') return s === 'confirmed' || s === 'active';
            if (tab === 'Completed') return s === 'completed' || s === 'returned';
            if (tab === 'Cancelled') return s === 'cancelled';
            return false;
        }).length;
    };

    const counts = {
        Active: getCount('Active'),
        Completed: getCount('Completed'),
        Cancelled: getCount('Cancelled'),
    };

    if (loading) {
        return (
            <div className="space-y-4 max-w-4xl mx-auto">
                <div className="h-8 bg-gray-100 w-48 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
                {[201, 202].map(i => (
                    <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-500 mt-1">Track and manage your rental history</p>
            </div>

            {/* Tabs */}
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-2 animate-fade-in">
                {['Active', 'Completed', 'Cancelled'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        {tab} <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {counts[tab]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {error ? (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center">
                    <p className="text-red-700 font-medium">{error}</p>
                    <button
                        onClick={fetchBookings}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-medium"
                    >
                        Retry
                    </button>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-gray-200" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">No {activeTab.toLowerCase()} bookings</h2>
                    <p className="text-gray-500 mt-2">You don't have any bookings in this category.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredBookings.map((booking, index) => (
                        <BookingCard
                            key={`bk-${booking.booking_id}-${index}`}
                            booking={booking}
                            onUpdate={fetchBookings}
                            animationDelay={`${index * 0.1}s`}
                        />
                    ))}
                </div>

            )}
        </div>
    );
};

export default MyBookingsPage;
