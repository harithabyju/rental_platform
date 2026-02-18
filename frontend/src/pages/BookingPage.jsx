import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
import { MapPin, Truck, Box, Star } from 'lucide-react';

const BookingPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();

    // Booking State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('pickup'); // 'pickup' | 'delivery'
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mock Item Details (Product Detail View)
    const product = {
        id: itemId,
        title: "Professional DSLR Camera Kit",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Canon EOS 5D Mark IV with 24-70mm f/2.8L II USM Lens. Perfect for professional photography and videography. Includes 2 batteries, charger, and carrying case.",
        rating: 4.8,
        reviews: 124,
        owner: {
            name: "John Pro",
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        },
        ratePerDay: 50,
        currency: "$"
    };

    // Constants
    const serviceFeeRate = 0.10;
    const taxRate = 0.05;
    const deliveryRatePerKm = 2;
    const mockDistanceKm = 5; // Mocking 5km distance for now

    const calculateBreakdown = () => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end - start;
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (days <= 0) return { error: 'End date must be after start date' };

        const subtotal = days * product.ratePerDay;
        const serviceFee = subtotal * serviceFeeRate;
        const tax = subtotal * taxRate;

        let deliveryFee = 0;
        if (deliveryMethod === 'delivery') {
            deliveryFee = mockDistanceKm * deliveryRatePerKm;
        }

        const total = subtotal + serviceFee + tax + deliveryFee;

        return { days, subtotal, serviceFee, tax, deliveryFee, total };
    };

    const breakdown = calculateBreakdown();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (breakdown?.error) {
            setError(breakdown.error);
            setLoading(false);
            return;
        }

        if (deliveryMethod === 'delivery' && !address.trim()) {
            setError('Please enter a delivery address');
            setLoading(false);
            return;
        }

        try {
            await createBooking({
                itemId,
                startDate,
                endDate,
                totalAmount: breakdown.total,
                deliveryMethod,
                deliveryFee: breakdown.deliveryFee
            });
            alert('Booking created successfully!');
            navigate('/my-bookings');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Product Details (Mock PDP) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <img src={product.image} alt={product.title} className="w-full h-64 object-cover" />
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-bold text-gray-900">{product.title}</h2>
                                <div className="flex items-center bg-emerald-50 px-2 py-1 rounded text-emerald-700 text-sm font-bold">
                                    <Star size={14} className="mr-1 fill-emerald-700" />
                                    {product.rating}
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mb-4">{product.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <img src={product.owner.image} alt={product.owner.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{product.owner.name}</p>
                                        <p className="text-xs text-gray-500">Owner • {product.owner.rating} ★</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Booking Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Date Selection */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    Select Dates
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="input-field"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="input-field"
                                            required
                                            min={startDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Method */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                    Delivery Method
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('pickup')}
                                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'pickup'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-200 hover:border-emerald-200'
                                            }`}
                                    >
                                        <Box size={24} />
                                        <span className="font-semibold">Self Pickup</span>
                                        <span className="text-xs">Free</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('delivery')}
                                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'delivery'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-200 hover:border-emerald-200'
                                            }`}
                                    >
                                        <Truck size={24} />
                                        <span className="font-semibold">Delivery Service</span>
                                        <span className="text-xs">From $2.00/km</span>
                                    </button>
                                </div>

                                {deliveryMethod === 'delivery' && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fadeIn">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Enter full address"
                                                className="input-field pl-10"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            * Distance calculated from owner's location ({mockDistanceKm}km detected)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown & Submit */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
                                    {breakdown && !breakdown.error ? (
                                        <>
                                            <div className="flex justify-between text-gray-600">
                                                <span>${product.ratePerDay} x {breakdown.days} days</span>
                                                <span>${breakdown.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Service Fee (10%)</span>
                                                <span>${breakdown.serviceFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Tax (5%)</span>
                                                <span>${breakdown.tax.toFixed(2)}</span>
                                            </div>
                                            {deliveryMethod === 'delivery' && (
                                                <div className="flex justify-between text-emerald-700 font-medium">
                                                    <span className="flex items-center gap-1"><Truck size={14} /> Delivery Fee ({mockDistanceKm}km)</span>
                                                    <span>${breakdown.deliveryFee.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                                <span>Total</span>
                                                <span>${breakdown.total.toFixed(2)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-500 italic">
                                            Select dates to see price breakdown
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !breakdown || breakdown.error}
                                    className="w-full btn-primary py-3 text-lg shadow-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : `Confirm & Pay $${breakdown?.total?.toFixed(2) || '0.00'}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
