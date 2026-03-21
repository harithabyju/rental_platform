import { useState, useEffect } from 'react';
import penaltyService from '../../services/penaltyService';

const DisputeManagement = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resolutionModal, setResolutionModal] = useState({ open: false, disputeId: null, details: '' });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const data = await penaltyService.getDisputes();
            setDisputes(data);
        } catch (err) {
            setError('Failed to fetch disputes');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (status) => {
        setProcessing(true);
        try {
            await penaltyService.resolveDispute(resolutionModal.disputeId, {
                status,
                resolutionDetails: resolutionModal.details
            });
            setResolutionModal({ open: false, disputeId: null, details: '' });
            fetchDisputes();
            alert(`Dispute ${status} successfully`);
        } catch (err) {
            alert('Failed to resolve dispute');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-extrabold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                        Dispute Management
                    </h2>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-8">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow-xl overflow-hidden border-b border-gray-200 sm:rounded-2xl">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Fine Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Dispute Reason</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {disputes.map((dispute) => (
                                        <tr key={dispute.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900">{dispute.customer_name}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-indigo-600">₹{parseFloat(dispute.fine_amount).toLocaleString()}</td>
                                            <td className="px-6 py-5 text-sm text-gray-600 max-w-xs truncate">{dispute.reason}</td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${dispute.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        dispute.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {dispute.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                {dispute.status === 'pending' && (
                                                    <button
                                                        onClick={() => setResolutionModal({ open: true, disputeId: dispute.id, details: '' })}
                                                        className="text-indigo-600 hover:text-indigo-900 font-bold px-4 py-2 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resolution Modal */}
            {resolutionModal.open && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Resolve Dispute</h3>
                        <p className="text-gray-500 mb-6">Review the case details and provide a final resolution statement.</p>

                        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Customer's Reason</h4>
                            <p className="text-gray-800 italic">"{disputes.find(d => d.id === resolutionModal.disputeId)?.reason}"</p>
                        </div>

                        <label className="block text-sm font-bold text-gray-700 mb-2">Resolution Details</label>
                        <textarea
                            value={resolutionModal.details}
                            onChange={(e) => setResolutionModal({ ...resolutionModal, details: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none h-40 mb-8"
                            placeholder="Explain the reason for your decision..."
                        ></textarea>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setResolutionModal({ open: false, disputeId: null, details: '' })}
                                className="px-6 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleResolve('rejected')}
                                disabled={processing}
                                className="px-6 py-3 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 disabled:opacity-50"
                            >
                                Reject Dispute
                            </button>
                            <button
                                onClick={() => handleResolve('accepted')}
                                disabled={processing}
                                className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50"
                            >
                                Accept & Waive Fine
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisputeManagement;
