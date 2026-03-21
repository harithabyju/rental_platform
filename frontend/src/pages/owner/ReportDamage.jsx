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
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Report Item Damage</h1>
                <p className="text-gray-500 mb-8 border-b pb-4">Booking Reference: <span className="text-indigo-600 font-bold">#{bookingId}</span></p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Detailed Description</label>
                        <textarea
                            className="w-full p-3 border rounded-xl h-40 focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="Describe the damage in detail. Include any relevant observations..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Damage Image URL (Optional)</label>
                        <input
                            type="url"
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="https://example.com/damage-image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1 italic">Provide a direct link to an image showing the damage for quicker verification.</p>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-lg ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportDamage;
