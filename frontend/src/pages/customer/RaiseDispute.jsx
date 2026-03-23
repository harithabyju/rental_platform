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
        <div className="max-w-xl mx-auto p-6 mt-16 min-h-[80vh]">
            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-gray-200 dark:border-gray-800 p-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-3">Initiate Dispute</h1>
                    <p className="text-gray-600 dark:text-gray-500 text-sm font-medium">Fine ID Reference: <span className="font-black text-emerald-600 dark:text-emerald-500 font-mono">#{fineId}</span></p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 rounded-2xl mb-10">
                    <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed font-medium">
                        <span className="font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest text-[10px] block mb-1">Moderation Notice</span>
                        Your claim will be manually reviewed by our compliance team. Provide clear evidence or reasoning for faster resolution.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Case Description</label>
                        <textarea
                            className="w-full bg-white dark:bg-gray-800/50 p-5 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl h-52 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none leading-relaxed"
                            placeholder="Detail exactly why you're disputing this penalty..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors bg-gray-100 dark:bg-gray-800/30 rounded-2xl order-2 sm:order-1 border border-gray-200 dark:border-transparent"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-md hover:bg-emerald-700 transition-all transform active:scale-95 order-1 sm:order-2 ${submitting ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            {submitting ? 'Processing...' : 'Submit Claim'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RaiseDispute;
