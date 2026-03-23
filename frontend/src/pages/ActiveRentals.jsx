import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as dashboardService from '../services/dashboardService';
import { ShieldAlert, Package, PhoneCall } from 'lucide-react';
import RentalStatusCard from '../components/RentalStatusCard';

const ActiveRentals = () => {
    const navigate = useNavigate();
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
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Active Rentals</h1>
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
                    <div className="w-14 h-14 bg-white dark:bg-[#111827] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
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

            {/* Rentals List */}
            {loading ? (
                <div className="grid grid-cols-1 gap-6">
                    {[101, 102].map(i => (
                        <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
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
                <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-gray-800/60 p-24 text-center shadow-sm animate-scale-up">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800/40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Package className="w-12 h-12 text-gray-800 dark:text-gray-200" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">Your rental shelf is empty!</h2>
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
                        <RentalStatusCard key={rental.bookingId} rental={rental} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveRentals;
