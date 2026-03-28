import React, { useState, useEffect } from 'react';
import penaltyService from '../../services/penaltyService';
import { toast } from 'react-toastify';

const AdminDisputePanel = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const data = await penaltyService.getDisputes();
            setDisputes(data);
        } catch (err) {
            toast.error('Failed to fetch disputes');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (status) => {
        if (!adminResponse) return toast.warning('Please provide a response for the user');
        try {
            await penaltyService.resolveDispute(selectedDispute.id, { status, adminResponse });
            toast.success(`Dispute ${status} successfully`);
            setSelectedDispute(null);
            setAdminResponse('');
            fetchDisputes();
        } catch (err) {
            toast.error('Resolution failed');
        }
    };

    return (
        <div className="p-6 min-h-screen bg-transparent">
            <h1 className="text-3xl font-black mb-8 text-emerald-600 dark:text-emerald-500 tracking-tight">Dispute Management Panel</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden text-gray-900 dark:text-gray-400">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                        <h2 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest text-sm">Open Disputes Queue</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-400 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-5">Customer</th>
                                    <th className="p-5">Fine Amount</th>
                                    <th className="p-5">Reason</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-10 text-center text-gray-400 animate-pulse font-bold">Loading disputes...</td></tr>
                                ) : disputes.length === 0 ? (
                                    <tr><td colSpan="5" className="p-10 text-center text-gray-500 italic">No disputes found.</td></tr>
                                ) : (
                                    disputes.map(dispute => (
                                        <tr 
                                            key={dispute.id} 
                                            className={`hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer group ${selectedDispute?.id === dispute.id ? 'bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-l-emerald-600 dark:border-l-emerald-500' : ''}`} 
                                            onClick={() => setSelectedDispute(dispute)}
                                        >
                                            <td className="p-5 font-bold text-gray-900 dark:text-gray-100">{dispute.customer_name}</td>
                                            <td className="p-5 font-black text-red-600 dark:text-red-400">₹{dispute.fine_amount}</td>
                                            <td className="p-5 text-gray-600 dark:text-gray-400 truncate max-w-xs text-sm">{dispute.reason}</td>
                                            <td className="p-5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${dispute.status === 'open' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' : 'bg-gray-100 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400'}`}>
                                                    {dispute.status}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <button className="text-emerald-600 dark:text-emerald-500 font-bold text-xs uppercase tracking-widest hover:text-emerald-700 dark:hover:text-emerald-400 underline decoration-emerald-500/30">Review</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 h-fit">
                    <h2 className="text-xl font-black mb-6 text-gray-900 dark:text-gray-100 uppercase tracking-tight">Resolution Details</h2>
                    {selectedDispute ? (
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-black tracking-widest block mb-2">Customer's Claim</label>
                                <p className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-gray-700 dark:text-gray-200 italic border border-gray-200 dark:border-gray-700 leading-relaxed text-sm">"{selectedDispute.reason}"</p>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-black tracking-widest block mb-2">Inciting Incident</label>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{selectedDispute.fine_description}</p>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-black tracking-widest block mb-2">Decision Log / Admin Response</label>
                                <textarea
                                    className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all h-36"
                                    placeholder="Explain the result clearly to the customer..."
                                    value={adminResponse}
                                    onChange={(e) => setAdminResponse(e.target.value)}
                                    disabled={selectedDispute.status !== 'open'}
                                />
                            </div>
                            {selectedDispute.status === 'open' ? (
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button
                                        onClick={() => handleResolve('rejected')}
                                        className="py-3 rounded-xl border-2 border-red-500/30 text-red-600 dark:text-red-400 font-black uppercase tracking-wider text-xs hover:bg-red-500/10 transition-all active:scale-95"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleResolve('resolved')}
                                        className="py-3 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-wider text-xs hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                                    >
                                        Resolve
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-xs border border-gray-200 dark:border-gray-700">
                                    Case Locked: {selectedDispute.status}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-24 text-gray-400 dark:text-gray-600">
                            <svg className="w-16 h-16 mx-auto mb-6 opacity-10 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg>
                            <p className="font-bold text-sm tracking-wide">Select a case from the queue to moderate.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDisputePanel;
