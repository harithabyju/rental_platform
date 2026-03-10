import React, { useState } from 'react';
import { cancelBooking, extendBooking, returnBooking } from '../services/bookingService';
import { Calendar, Clock, CheckCircle, Star, AlertCircle, MapPin } from 'lucide-react';
import ReviewModal from './ReviewModal';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const BookingCard = ({ booking, onUpdate, animationDelay = '0s' }) => {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel?')) {
            try {
                await cancelBooking(booking.booking_id);
                onUpdate();
            } catch (err) {
                alert(err.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    const handleExtend = async () => {
        const dateInput = prompt('Enter new end date (YYYY-MM-DD):');
        if (dateInput) {
            try {
                await extendBooking(booking.booking_id, dateInput);
                onUpdate();
            } catch (err) {
                alert(err.response?.data?.message || 'Error extending booking');
            }
        }
    };

    const handleReturn = async () => {
        if (window.confirm('Confirm return?')) {
            try {
                await returnBooking(booking.booking_id);
                onUpdate();
            } catch (err) {
                alert(err.response?.data?.message || 'Error returning booking');
            }
        }
    };

    const getTimelineStatus = () => {
        const status = (booking.status || '').toLowerCase();
        if (status === 'cancelled') return -1;
        if (status === 'completed' || status === 'returned') return 3;
        const now = new Date();
        const start = new Date(booking.start_date);
        if (now >= start) return 2;
        return 1;
    };

    const currentStep = getTimelineStatus();

    const getStatusColor = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'confirmed': return 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/30';
            case 'active': return 'bg-emerald-600 text-white';
            case 'completed':
            case 'returned': return 'bg-blue-900/50 text-blue-300 border border-blue-700/30';
            case 'cancelled': return 'bg-red-900/50 text-red-300 border border-red-700/30';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
        }
    };

    const itemImg = booking.item_image
        ? (booking.item_image.startsWith('http') ? booking.item_image : `${BACKEND_URL}${booking.item_image}`)
        : 'https://placehold.co/400x300/1E293B/64748B?text=No+Image';

    return (
        <div
            className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-xl hover:shadow-black/30 transition-all duration-500 animate-slide-up overflow-hidden group"
            style={{ animationDelay }}
        >
            <div className="flex flex-col md:flex-row">
                {/* Item Image */}
                <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden">
                    <img
                        src={itemImg}
                        alt={booking.item_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md ${getStatusColor(booking.status)}`}>
                            {booking.status}
                        </span>
                    </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-1">{booking.item_name}</h3>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <MapPin size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{booking.shop_name} • {booking.shop_city}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Total Paid</p>
                                <p className="text-2xl font-black text-emerald-400">₹{booking.total_amount}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-700/30 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm flex items-center justify-center text-emerald-400">
                                    <Calendar size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Start Date</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{new Date(booking.start_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-700/30 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm flex items-center justify-center text-blue-400">
                                    <Clock size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">End Date</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{new Date(booking.end_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Actions */}
                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        {booking.status !== 'cancelled' ? (
                            <div className="flex gap-4">
                                {['Confirmed', 'Active', 'Completed'].map((step, index) => {
                                    const stepNum = index + 1;
                                    const isReached = currentStep >= stepNum;
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-1.5">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-500 ${isReached ? 'border-emerald-500 bg-emerald-900/50 text-emerald-400 scale-110' : 'border-gray-700 text-gray-600'}`}>
                                                {isReached ? <CheckCircle size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />}
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${isReached ? 'text-emerald-400' : 'text-gray-600'}`}>{step}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertCircle size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Booking Cancelled</span>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {booking.status === 'confirmed' && (
                                <>
                                    <button onClick={handleExtend} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-all">Extend</button>
                                    <button onClick={handleCancel} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all">Cancel</button>
                                    <button onClick={handleReturn} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 hover:-translate-y-1 transition-all">Confirm Return</button>
                                </>
                            )}
                            {(booking.status === 'completed' || booking.status === 'returned') && (
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-lg shadow-amber-900/30 hover:bg-amber-400 hover:-translate-y-1 transition-all flex items-center gap-2"
                                >
                                    <Star size={12} className="fill-white" /> Rate & Review
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                booking={booking}
                onSuccess={onUpdate}
            />
        </div>
    );
};

export default BookingCard;
