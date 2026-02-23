import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import penaltyService from '../../services/penaltyService';
import { toast } from 'react-toastify';

const RaiseDispute = () => {
    const { fineId } = useParams();
    const navigate = useNavigate();
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) return toast.warning('Please provide a reason for the dispute');

        setSubmitting(true);
        try {
            await penaltyService.raiseDispute({ fineId, reason });
            toast.success('Dispute raised successfully');
            navigate('/fines');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to raise dispute');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 mt-10">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-gray-800">Raise a Dispute</h1>
                    <p className="text-gray-500 text-sm">Fine ID Reference: <span className="font-bold text-indigo-600">#{fineId}</span></p>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl mb-8">
                    <p className="text-yellow-800 text-sm leading-relaxed">
                        <span className="font-bold">Note:</span> Disputes are reviewed by our administration team. Please provide a clear and honest explanation of why you believe this penalty is incorrect.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Reason for Dispute</label>
                        <textarea
                            className="w-full p-4 border rounded-2xl h-48 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition outline-none"
                            placeholder="Explain why you are disputing this fine..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700 transition"
                        >
                            Go Back
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition transform active:scale-95 ${submitting ? 'opacity-50' : ''}`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Dispute'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RaiseDispute;
