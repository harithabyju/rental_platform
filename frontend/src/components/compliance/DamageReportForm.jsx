import React, { useState } from 'react';
import complianceService from '../../services/compliance.service';
import { toast } from 'react-toastify';

const DamageReport = ({ bookingId, onReportSubmitted }) => {
    const [description, setDescription] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await complianceService.reportDamage({
                booking_id: bookingId,
                description,
                image_urls: imageUrls // In a real app, you'd upload files first and get URLs
            });
            toast.success('Damage report submitted for review.');
            if (onReportSubmitted) onReportSubmitted();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Report Damage / Accident</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description of Damage</label>
                    <textarea
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        rows="4"
                        placeholder="Please describe the accident or damage in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-sm text-red-700">
                        <strong>Note:</strong> Accurately reporting damages helps in fair resolution.
                        Fines will be deducted from the security deposit after admin verification.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Damage Report'}
                </button>
            </form>
        </div>
    );
};

export default DamageReport;
