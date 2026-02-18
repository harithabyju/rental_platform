import React from 'react';
import { cancelBooking, extendBooking, returnBooking } from '../services/bookingService';
import { Calendar, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const BookingCard = ({ booking, onUpdate }) => {
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
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'active': return 'bg-emerald-100 text-emerald-800';
            case 'completed':
            case 'returned': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="card mb-6 transition-all hover:shadow-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <Calendar size={20} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Booking #{booking.booking_id}</h3>
                        <p className="text-xs text-gray-500">Item ID: {booking.item_id}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(booking.status)}`}>
                    {booking.status}
                </span>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-start gap-3">
                        <Clock size={18} className="text-gray-400 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500">Rental Period</p>
                            <p className="font-medium text-gray-900">
                                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <DollarSign size={18} className="text-gray-400 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="font-medium text-gray-900">${booking.total_amount}</p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                {booking.status !== 'cancelled' && (
                    <div className="relative mb-8 px-2">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500"
                            style={{ width: currentStep === 3 ? '100%' : currentStep === 2 ? '50%' : '0%' }}
                        ></div>

                        <div className="relative flex justify-between">
                            {['Confirmed', 'Active', 'Completed'].map((step, index) => {
                                const stepNum = index + 1;
                                const isCompleted = currentStep >= stepNum;
                                return (
                                    <div key={step} className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-colors ${isCompleted ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-gray-300'
                                            }`}>
                                            {isCompleted ? <CheckCircle size={16} fill="currentColor" className="text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                        </div>
                                        <span className={`text-xs font-medium ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
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
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                        <button onClick={handleExtend} className="btn-secondary text-sm">
                            Extend Booking
                        </button>
                        <button onClick={handleCancel} className="btn-danger text-sm bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-none">
                            Cancel Booking
                        </button>
                        {/* Return button usually appears when active, but kept here based on old logic */}
                        <button onClick={handleReturn} className="btn-secondary text-sm ml-auto">
                            Return
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingCard;
