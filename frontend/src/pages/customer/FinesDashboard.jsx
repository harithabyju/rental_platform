import { useState, useEffect } from 'react';
import penaltyService from '../../services/penaltyService';

const FinesDashboard = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [disputeModal, setDisputeModal] = useState({ open: false, fineId: null, reason: '' });
    const [submittingDispute, setSubmittingDispute] = useState(false);

    useEffect(() => {
        fetchFines();
    }, []);

    const fetchFines = async () => {
        try {
            const data = await penaltyService.getMyFines();
            setFines(data);
        } catch (err) {
            setError('Failed to fetch fines');
        } finally {
            setLoading(false);
        }
    };

    const handleRaiseDispute = async () => {
        if (!disputeModal.reason.trim()) return;
        setSubmittingDispute(true);
        try {
            await penaltyService.raiseDispute({
                fineId: disputeModal.fineId,
                reason: disputeModal.reason
            });
            setDisputeModal({ open: false, fineId: null, reason: '' });
            fetchFines();
            alert('Dispute raised successfully');
        } catch (err) {
            alert('Failed to raise dispute');
        } finally {
            setSubmittingDispute(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fines & Penalties</h1>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                    {fines.filter(f => f.status === 'unpaid').length} Pending Fines
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {fines.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-xl font-medium">No fines recorded. You're all clear!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fines.map((fine) => (
                        <div key={fine.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <div className={`h-2 w-full ${fine.status === 'unpaid' ? 'bg-orange-500' : fine.status === 'paid' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{fine.type.replace('_', ' ')}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${fine.status === 'unpaid' ? 'bg-orange-100 text-orange-700' :
                                            fine.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {fine.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{fine.item_name}</h3>
                                <p className="text-2xl font-black text-gray-900 mb-4">₹{parseFloat(fine.amount).toLocaleString()}</p>
                                <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{fine.reason}"</p>

                                {fine.status === 'unpaid' && (
                                    <div className="flex space-x-3">
                                        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                                            Pay Now
                                        </button>
                                        <button
                                            onClick={() => setDisputeModal({ open: true, fineId: fine.id, reason: '' })}
                                            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                                        >
                                            Dispute
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dispute Modal */}
            {disputeModal.open && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl transform transition-all">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Raise a Dispute</h3>
                        <p className="text-gray-600 mb-6">Tell us why you believe this fine is incorrect. An admin will review your case.</p>
                        <textarea
                            value={disputeModal.reason}
                            onChange={(e) => setDisputeModal({ ...disputeModal, reason: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 mb-6"
                            placeholder="Provide details about your dispute..."
                        ></textarea>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setDisputeModal({ open: false, fineId: null, reason: '' })}
                                className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRaiseDispute}
                                disabled={submittingDispute || !disputeModal.reason.trim()}
                                className="flex-1 py-3 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinesDashboard;
