import { useEffect, useState } from 'react';
import * as dashboardService from '../services/dashboardService';
import RentalStatusCard from '../components/RentalStatusCard';
import { Package, Clock, ShieldAlert, PhoneCall } from 'lucide-react';

const ActiveRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActiveRentals = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await dashboardService.getActiveRentals();
            setRentals(res.data);
        } catch (err) {
            setError('Failed to load active rentals.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveRentals();
    }, []);

    const overdueCount = rentals.filter(r => r.isOverdue).length;

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Active Rentals</h1>
                    <p className="text-gray-500 font-medium mt-1">Track items you currently have and their return dates</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-black border border-emerald-100 shadow-sm">
                        {rentals.length} Total Items
                    </div>
                </div>
            </div>

            {/* Overdue Alert */}
            {overdueCount > 0 && (
                <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] flex items-start gap-6 shadow-xl shadow-red-100 animate-scale-up">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-red-900">Immediate Action Required</h3>
                        <p className="text-base text-red-700 mt-1 font-medium leading-relaxed">
                            You have {overdueCount} item{overdueCount > 1 ? 's' : ''} that are past their return date. Late fines are being applied. Please return them to avoid further charges.
                        </p>
                    </div>
                </div>
            )}

            {/* Support Box */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-emerald-950 p-8 rounded-[2rem] text-white shadow-2xl animate-slide-up">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <PhoneCall className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black mb-1">Facing issues with a rental?</h4>
                            <p className="text-gray-400 font-medium">Our concierge support is available 24/7 to help you.</p>
                        </div>
                    </div>
                    <button className="w-full md:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                        Get Priority Support
                    </button>
                </div>
            </div>

            {/* Rentals List */}
            {loading ? (
                <div className="grid grid-cols-1 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="h-48 bg-white border border-gray-100 rounded-[2rem] animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-12 text-center">
                    <p className="text-red-700 font-bold mb-6">{error}</p>
                    <button
                        onClick={fetchActiveRentals}
                        className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100"
                    >
                        Retry Loading
                    </button>
                </div>
            ) : rentals.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 p-24 text-center shadow-sm animate-scale-up">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Package className="w-12 h-12 text-gray-200" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">Your rental shelf is empty!</h2>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">
                        You don't have any items on rent right now. Ready to find your next project or adventure?
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/browse')}
                        className="mt-10 px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all active:scale-95 shadow-2xl shadow-emerald-100"
                    >
                        Explore Catalog
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {rentals.map(rental => (
                        <RentalStatusCard key={rental.rentalId} rental={rental} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveRentals;
