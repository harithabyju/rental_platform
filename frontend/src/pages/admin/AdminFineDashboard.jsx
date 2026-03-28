import React, { useState, useEffect } from 'react';
import penaltyService from '../../services/penaltyService';
import { toast } from 'react-toastify';

const AdminFineDashboard = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [bookingIdInput, setBookingIdInput] = useState('');

    useEffect(() => {
        fetchFines();
    }, []);

    const fetchFines = async () => {
        try {
            const data = await penaltyService.getAllFines();
            setFines(data);
        } catch (err) {
            toast.error('Failed to fetch fines');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateFine = async () => {
        if (!bookingIdInput) return toast.warning('Please enter a Booking ID');
        try {
            await penaltyService.calculateFine(bookingIdInput);
            toast.success('Late fine calculated and notified!');
            setBookingIdInput('');
            fetchFines();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Calculation failed');
        }
    };

    const filteredFines = fines.filter(f => filter === 'all' || f.status === filter);

    return (
        <div className="p-6 min-h-screen bg-transparent">
            <h1 className="text-3xl font-black mb-8 text-emerald-600 dark:text-emerald-500 tracking-tight">Fine & Penalty Management</h1>

            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl shadow-sm mb-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Late Return Fine Calculator</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter Booking ID"
                        className="flex-1 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={bookingIdInput}
                        onChange={(e) => setBookingIdInput(e.target.value)}
                    />
                    <button
                        onClick={handleCalculateFine}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all transform active:scale-95 shadow-md"
                    >
                        Calculate & Notify
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-sm">All Penalties History</h2>
                    <select
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="disputed">Disputed</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-5">Booking ID</th>
                                <th className="p-5">Customer</th>
                                <th className="p-5">Item</th>
                                <th className="p-5">Type</th>
                                <th className="p-5">Amount</th>
                                <th className="p-5">Status</th>
                                <th className="p-5">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {loading ? (
                                <tr><td colSpan="7" className="p-10 text-center text-gray-400 animate-pulse">Loading fine data...</td></tr>
                            ) : filteredFines.length === 0 ? (
                                <tr><td colSpan="7" className="p-10 text-center text-gray-500 italic">No fines found in this category.</td></tr>
                            ) : (
                                filteredFines.map(fine => (
                                    <tr key={fine.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                        <td className="p-5 font-bold text-emerald-600 dark:text-emerald-500">#{fine.booking_id}</td>
                                        <td className="p-5 text-gray-700 dark:text-gray-300">{fine.customer_name}</td>
                                        <td className="p-5 text-gray-700 dark:text-gray-300 font-medium">{fine.item_name}</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${fine.fine_type === 'late' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                                                {fine.fine_type}
                                            </span>
                                        </td>
                                        <td className="p-5 font-black text-gray-900 dark:text-gray-100 text-lg">₹{fine.amount}</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${fine.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' :
                                                    fine.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                                                        fine.status === 'disputed' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20'
                                                }`}>
                                                {fine.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-gray-500 text-xs font-mono">{new Date(fine.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFineDashboard;
