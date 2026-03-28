import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import penaltyService from '../../services/penaltyService';
import { toast } from 'react-toastify';

const ReportDamage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description) return toast.warning('Please provide a description');

        setSubmitting(true);
        try {
            await penaltyService.reportDamage({
                bookingId,
                description,
                images: imageUrl ? [imageUrl] : []
            });
            toast.success('Damage report submitted to administrator');
            navigate('/owner/dashboard'); // Assuming owner dashboard exists
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 mt-16 pb-20">
            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-gray-200 dark:border-gray-800 p-10">
                <div className="mb-10 pb-6 border-b border-gray-200 dark:border-gray-800/50">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-3">Item Damage Report</h1>
                    <p className="text-gray-600 dark:text-gray-500 text-sm font-medium">Booking Audit Reference: <span className="text-emerald-600 dark:text-emerald-500 font-black font-mono">#{bookingId}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Damage Description</label>
                        <textarea
                            className="w-full bg-white dark:bg-gray-800/50 p-5 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl h-44 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none leading-relaxed"
                            placeholder="Provide a specific account of the damage observed. Be clinical and factual..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Evidence URL <span className="text-gray-400 dark:text-gray-600">(Manual link)</span></label>
                        <input
                            type="url"
                            className="w-full bg-white dark:bg-gray-800/50 p-4 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                            placeholder="https://imgur.com/your-image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-3 italic font-medium">Add a photo link to accelerate the insurance and fine verification process.</p>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors bg-gray-100 dark:bg-gray-800/30 rounded-2xl order-2 sm:order-1 border border-gray-200 dark:border-transparent"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-md hover:bg-red-700 transition-all transform active:scale-95 order-1 sm:order-2 ${submitting ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Processing...' : 'File Damage Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportDamage;
