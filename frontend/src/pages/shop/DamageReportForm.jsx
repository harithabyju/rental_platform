import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingService from '../../services/booking.service';
import penaltyService from '../../services/penaltyService';

const DamageReportForm = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [description, setDescription] = useState('');
    const [estimatedCost, setEstimatedCost] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            // Assuming bookingService has a getBookingById or similar
            const data = await bookingService.getBookingById(bookingId);
            setBooking(data);
        } catch (err) {
            setError('Failed to load booking details');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await penaltyService.reportDamage({
                bookingId,
                description,
                estimatedCost: parseFloat(estimatedCost)
            });
            setSuccess('Damage report submitted successfully and fine generated.');
            setTimeout(() => navigate('/shop/bookings'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit damage report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Report Damage</h1>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                    <p className="text-green-700">{success}</p>
                </div>
            )}

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="p-8">
                    {booking && (
                        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <h2 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2">Booking Reference</h2>
                            <p className="text-lg font-bold text-blue-900">#{booking.id} - {booking.item_name}</p>
                            <p className="text-sm text-blue-700">Customer: {booking.customer_name}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Damage Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                                rows="4"
                                placeholder="Describe the damage in detail..."
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Repair Cost (₹)</label>
                            <input
                                type="number"
                                value={estimatedCost}
                                onChange={(e) => setEstimatedCost(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition-all duration-200 ${loading
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25'
                                    }`}
                            >
                                {loading ? 'Submitting...' : 'Submit Damage Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DamageReportForm;
