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
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dispute Management Panel</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-gray-700">Open Disputes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Fine Amount</th>
                                    <th className="p-4">Reason</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-10 text-center text-gray-500">Loading disputes...</td></tr>
                                ) : disputes.length === 0 ? (
                                    <tr><td colSpan="5" className="p-10 text-center text-gray-500">No disputes found.</td></tr>
                                ) : (
                                    disputes.map(dispute => (
                                        <tr key={dispute.id} className={`hover:bg-indigo-50 transition cursor-pointer ${selectedDispute?.id === dispute.id ? 'bg-indigo-50' : ''}`} onClick={() => setSelectedDispute(dispute)}>
                                            <td className="p-4 font-medium">{dispute.customer_name}</td>
                                            <td className="p-4 font-bold text-red-600">${dispute.fine_amount}</td>
                                            <td className="p-4 truncate max-w-xs">{dispute.reason}</td>
                                            <td className="p-4 capitalize text-sm">{dispute.status}</td>
                                            <td className="p-4">
                                                <button className="text-indigo-600 font-semibold text-sm hover:underline">View Details</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Resolution Details</h2>
                    {selectedDispute ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 uppercase font-bold tracking-wider">Customer Reason</label>
                                <p className="bg-gray-50 p-3 rounded-lg mt-1 text-gray-700 italic border border-dashed">"{selectedDispute.reason}"</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 uppercase font-bold tracking-wider">Fine Context</label>
                                <p className="mt-1 text-gray-700">{selectedDispute.fine_description}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 uppercase font-bold tracking-wider">Admin Response</label>
                                <textarea
                                    className="w-full mt-1 p-2 border rounded-lg h-32"
                                    placeholder="Explain the resolution to the customer..."
                                    value={adminResponse}
                                    onChange={(e) => setAdminResponse(e.target.value)}
                                    disabled={selectedDispute.status !== 'open'}
                                />
                            </div>
                            {selectedDispute.status === 'open' ? (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button
                                        onClick={() => handleResolve('rejected')}
                                        className="py-2 rounded-lg border border-red-200 text-red-600 font-bold hover:bg-red-50 transition"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleResolve('resolved')}
                                        className="py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-sm"
                                    >
                                        Resolve & Waive
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center font-semibold text-gray-500">
                                    This dispute is already {selectedDispute.status}.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg>
                            <p>Select a dispute to view details and take action.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDisputePanel;
