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
        <div className="p-6 max-w-5xl mx-auto min-h-screen bg-transparent">
            <h1 className="text-3xl font-black mb-10 text-emerald-600 dark:text-emerald-500 tracking-tight">My Penalties & Fines</h1>

            {loading ? (
                <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Loading your penalties...</div>
            ) : fines.length === 0 ? (
                <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md p-16 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center shadow-sm">
                    <p className="text-xl text-gray-400">Great! You have no pending fines or penalties.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {fines.map(fine => (
                        <div key={fine.id} className="bg-white dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row transition-all hover:border-emerald-500/50 group">
                            <div className={`p-4 md:w-3 flex flex-col justify-center ${fine.status === 'pending' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                            <div className="p-8 flex-1">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{fine.item_name}</h2>
                                        <p className="text-gray-500 text-sm mt-1 font-mono">Reference: <span className="text-emerald-600 font-bold">#{fine.booking_id}</span></p>
                                    </div>
                                    <div className="text-left md:text-right w-full md:w-auto">
                                        <div className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">₹{fine.amount}</div>
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${fine.status === 'pending' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' :
                                                fine.status === 'disputed' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                                    fine.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                            }`}>
                                            {fine.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-xl mb-6 border border-gray-200 dark:border-gray-800/50">
                                    <span className="text-[10px] uppercase font-black text-gray-500 block mb-2 tracking-widest">Reason / Description</span>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{fine.description}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {fine.status === 'pending' && (
                                        <>
                                            <button className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-emerald-700 transition-all transform active:scale-95 shadow-sm">
                                                Pay Penalty
                                            </button>
                                            <Link
                                                to={`/dispute/${fine.id}`}
                                                className="flex-1 py-3 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-500 rounded-xl font-black uppercase tracking-wider hover:bg-emerald-500/10 transition-all text-center"
                                            >
                                                Raise Dispute
                                            </Link>
                                        </>
                                    )}
                                    {fine.status === 'disputed' && (
                                        <div className="flex-1 py-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl font-bold text-center border border-purple-500/20 uppercase tracking-widest text-xs">
                                            Dispute under investigation
                                        </div>
                                    )}
                                    {(fine.status === 'resolved' || fine.status === 'paid') && (
                                        <div className="flex-1 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-center border border-emerald-500/20 uppercase tracking-widest text-xs">
                                            Penalty Settled
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
