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
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Fine & Penalty Management</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Late Return Fine Calculator</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter Booking ID"
                        className="flex-1 p-2 border rounded-lg"
                        value={bookingIdInput}
                        onChange={(e) => setBookingIdInput(e.target.value)}
                    />
                    <button
                        onClick={handleCalculateFine}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Calculate & Notify
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">All Penalties</h2>
                    <select
                        className="p-2 border rounded-lg"
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
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4">Booking ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Item</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="7" className="p-10 text-center text-gray-500">Loading fine data...</td></tr>
                            ) : filteredFines.length === 0 ? (
                                <tr><td colSpan="7" className="p-10 text-center text-gray-500">No fines found.</td></tr>
                            ) : (
                                filteredFines.map(fine => (
                                    <tr key={fine.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-indigo-600">#{fine.booking_id}</td>
                                        <td className="p-4">{fine.customer_name}</td>
                                        <td className="p-4">{fine.item_name}</td>
                                        <td className="p-4 capitalize">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fine.fine_type === 'late' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                {fine.fine_type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">${fine.amount}</td>
                                        <td className="p-4 capitalize">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fine.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    fine.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                        fine.status === 'disputed' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {fine.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">{new Date(fine.created_at).toLocaleDateString()}</td>
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
