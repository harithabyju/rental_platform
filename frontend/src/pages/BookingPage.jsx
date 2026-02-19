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
        currency: "₹"
    };

    // Constants
    const serviceFeeRate = 0.10;
    const taxRate = 0.05;
    const deliveryRatePerKm = 10; // 10 Rupees per km
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
            // Using a simple alert for now, but in a real app would use a toast
            alert('Booking created successfully!');
            navigate('/dashboard/bookings');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 animate-fade-in px-4">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Finalize Reservation</h1>
                <p className="text-gray-500 font-medium mt-2">Check details and enter your preferences below</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* LEFT COLUMN: Product Details */}
                <div className="lg:col-span-1 space-y-8 animate-slide-up">
                    <div className="card overflow-hidden group shadow-2xl shadow-gray-100">
                        <div className="relative h-72 overflow-hidden">
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-emerald-700 text-xs font-black shadow-lg">
                                <Star size={14} className="mr-1 fill-emerald-600 text-emerald-600" />
                                {product.rating} (124)
                            </div>
                        </div>
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{product.title}</h2>
                            <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">{product.description}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-100 p-0.5">
                                        <img src={product.owner.image} alt={product.owner.name} className="w-full h-full object-cover rounded-[0.8rem]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Offered by</p>
                                        <p className="text-sm font-black text-gray-900">{product.owner.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-emerald-600">₹{product.ratePerDay}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase">per day</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Booking Form */}
                <div className="lg:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="card p-10">
                        <form onSubmit={handleSubmit} className="space-y-12">
                            {error && (
                                <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl text-red-700 animate-scale-up flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Box className="w-6 h-6 text-red-600" />
                                    </div>
                                    <p className="font-bold">{error}</p>
                                </div>
                            )}

                            {/* Section 1: Dates */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-200">1</div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">When do you need it?</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pick-up Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="input-field py-4 focus:ring-4 focus:ring-emerald-50"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Return Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="input-field py-4 focus:ring-4 focus:ring-emerald-50"
                                            required
                                            min={startDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Method */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-200">2</div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">How will you get it?</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('pickup')}
                                        className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all duration-300 ${deliveryMethod === 'pickup'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xl shadow-emerald-100 scale-105'
                                            : 'border-gray-50 hover:border-emerald-100 text-gray-400'
                                            }`}
                                    >
                                        <div className={`p-4 rounded-2xl ${deliveryMethod === 'pickup' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                                            <Box size={28} />
                                        </div>
                                        <span className="font-black text-lg">Self Pickup</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Always Free</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('delivery')}
                                        className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all duration-300 ${deliveryMethod === 'delivery'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xl shadow-emerald-100 scale-105'
                                            : 'border-gray-50 hover:border-emerald-100 text-gray-400'
                                            }`}
                                    >
                                        <div className={`p-4 rounded-2xl ${deliveryMethod === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                                            <Truck size={28} />
                                        </div>
                                        <span className="font-black text-lg">Doorstep Delivery</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Fast & Secured</span>
                                    </button>
                                </div>

                                {deliveryMethod === 'delivery' && (
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-[2rem] border-2 border-emerald-100/50 animate-scale-up space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest ml-1">Your Delivery Address</label>
                                            <div className="relative mt-2">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
                                                <input
                                                    type="text"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="St. Morning, Block 7, Noida..."
                                                    className="input-field pl-12 py-4 border-2 border-emerald-100 focus:border-emerald-500 focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-tight">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Approx. {mockDistanceKm}km away from fulfillment center
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Breakdown & Submit */}
                            <div className="pt-12 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Price Breakdown</h3>
                                    <div className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Currency: INR (₹)
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 rounded-[2rem] p-8 space-y-5 mb-10 border border-gray-100">
                                    {breakdown && !breakdown.error ? (
                                        <>
                                            <div className="flex justify-between items-center text-gray-500">
                                                <span className="font-bold">Rental Amount ({breakdown.days} days)</span>
                                                <span className="font-black text-gray-900 text-lg">₹{breakdown.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-500">
                                                <span className="font-bold">Service & Protection Fee</span>
                                                <span className="font-black text-gray-900 text-lg">₹{breakdown.serviceFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-500">
                                                <span className="font-bold">GST & Taxes (5%)</span>
                                                <span className="font-black text-gray-900 text-lg">₹{breakdown.tax.toFixed(2)}</span>
                                            </div>
                                            {deliveryMethod === 'delivery' && (
                                                <div className="flex justify-between items-center text-emerald-700">
                                                    <span className="font-black flex items-center gap-2"><Truck size={18} /> Delivery Charges</span>
                                                    <span className="font-black text-lg">₹{breakdown.deliveryFee.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="h-px bg-gray-200 mt-4" />
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-xl font-black text-gray-900">Total Payable</span>
                                                <div className="text-right">
                                                    <span className="text-4xl font-black text-emerald-600 tracking-tighter">₹{breakdown.total.toFixed(2)}</span>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 italic">All inclusive</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400 font-bold italic py-8">
                                            Please select rental dates to calculate your total
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !breakdown || breakdown.error}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-[2rem] text-xl font-black shadow-2xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
                                >
                                    <span className="group-hover:tracking-widest transition-all duration-300">
                                        {loading ? 'Processing Transaction...' : `Confirm Payment • ₹${breakdown?.total?.toFixed(2) || '0.00'}`}
                                    </span>
                                </button>
                                <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-6">
                                    Secure 256-bit Encrypted Transaction
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
