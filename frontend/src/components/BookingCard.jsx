import React from 'react';
import { cancelBooking, extendBooking, returnBooking } from '../services/bookingService';
import { Calendar, Clock, IndianRupee, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const BookingCard = ({ booking, onUpdate, animationDelay = '0s' }) => {
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

    // Helper to determine active step in timeline
    const getTimelineStatus = () => {
        const status = booking.status.toLowerCase();
        if (status === 'cancelled') return -1;
        if (status === 'completed' || status === 'returned') return 3;

        const now = new Date();
        const start = new Date(booking.start_date);

        if (now >= start) return 2; // Active
        return 1; // Confirmed
    };

    const currentStep = getTimelineStatus();

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-800';
            case 'active': return 'bg-emerald-600 text-white';
            case 'completed':
            case 'returned': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div
            className="card mb-6 transition-all hover:shadow-lg animate-slide-up group"
            style={{ animationDelay }}
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Calendar size={20} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Booking #{booking.booking_id}</h3>
                        <p className="text-xs text-gray-500 font-medium">Item ID: {booking.item_id}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(booking.status)}`}>
                    {booking.status}
                </span>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <Clock size={18} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rental Period</p>
                            <p className="font-semibold text-gray-900">
                                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <IndianRupee size={18} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="font-bold text-emerald-600 text-xl">₹{booking.total_amount}</p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                {booking.status !== 'cancelled' && (
                    <div className="relative mb-10 px-2">
                        <div className="absolute top-[15px] left-0 right-0 h-[2px] bg-gray-100 rounded-full"></div>
                        <div
                            className="absolute top-[15px] left-0 h-[2px] bg-emerald-500 rounded-full transition-all duration-1000 ease-in-out"
                            style={{ width: currentStep === 3 ? '100%' : currentStep === 2 ? '50%' : '10%' }}
                        ></div>


                        <div className="relative flex justify-between">
                            {['Confirmed', 'Active', 'Completed'].map((step, index) => {
                                const stepNum = index + 1;
                                const isCompleted = currentStep >= stepNum;
                                const isCurrent = currentStep === stepNum;
                                return (
                                    <div key={step} className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 z-10 bg-white transition-all duration-300 ${isCompleted ? 'border-emerald-500 bg-emerald-600 text-white scale-110 shadow-lg shadow-emerald-100' : 'border-gray-200 text-gray-300'
                                            }`}>
                                            {isCompleted ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {booking.status === 'confirmed' && (
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                        <button onClick={handleExtend} className="btn-secondary text-xs py-2 px-4 border-gray-200 text-gray-600 hover:border-emerald-600 hover:text-emerald-600 hover-tilt active-press active-pop">
                            Extend
                        </button>
                        <button onClick={handleCancel} className="bg-red-50 text-red-600 text-xs font-bold py-2 px-4 rounded-lg hover:bg-red-100 transition-colors hover-tilt active-press active-pop">
                            Cancel
                        </button>
                        <button onClick={handleReturn} className="btn-primary text-xs py-2 px-4 ml-auto hover-tilt active-press active-pop">
                            Confirm Return
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingCard;
