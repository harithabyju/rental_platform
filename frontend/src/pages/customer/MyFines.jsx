import React, { useState, useEffect } from 'react';
import penaltyService from '../../services/penaltyService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const MyFines = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFines();
    }, []);

    const fetchFines = async () => {
        try {
            const data = await penaltyService.getMyFines();
            setFines(data);
        } catch (err) {
            toast.error('Failed to load penalties');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Penalties & Fines</h1>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading your penalties...</div>
            ) : fines.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-dashed text-center text-gray-500 shadow-sm">
                    <p className="text-lg">Great! You have no pending fines or penalties.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {fines.map(fine => (
                        <div key={fine.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                            <div className={`p-4 md:w-4 flex flex-col justify-center ${fine.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{fine.item_name}</h2>
                                        <p className="text-gray-500 text-sm">Booking Reference: <span className="font-semibold">#{fine.booking_id}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-gray-900">${fine.amount}</div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${fine.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                fine.status === 'disputed' ? 'bg-purple-100 text-purple-700' :
                                                    fine.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {fine.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                                    <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Reason / Description</span>
                                    <p className="text-gray-700 text-sm">{fine.description}</p>
                                </div>
                                <div className="flex gap-4">
                                    {fine.status === 'pending' && (
                                        <>
                                            <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-md">
                                                Pay Now
                                            </button>
                                            <Link
                                                to={`/dispute/${fine.id}`}
                                                className="flex-1 py-2 border border-indigo-100 text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition text-center"
                                            >
                                                Raise Dispute
                                            </Link>
                                        </>
                                    )}
                                    {fine.status === 'disputed' && (
                                        <div className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-lg font-bold text-center border border-purple-100">
                                            Dispute under review
                                        </div>
                                    )}
                                    {fine.status === 'resolved' && (
                                        <div className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg font-bold text-center border border-green-100">
                                            Penalty Resolved
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyFines;
