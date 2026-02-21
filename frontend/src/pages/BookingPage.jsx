import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
import { getShopItemDetails } from '../services/dashboardService';
import paymentService from '../services/paymentService';
import { MapPin, Truck, Box, Star, Loader2, CheckCircle, CreditCard, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

const BookingPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();

    // Data State
    const [product, setProduct] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Booking State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('pickup'); // 'pickup' | 'delivery'
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Constants
    const serviceFeeRate = 0.10;
    const taxRate = 0.05;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await getShopItemDetails(itemId);
                setProduct(res.data);
            } catch (err) {
                toast.error('Failed to load item details');
                navigate('/dashboard');
            } finally {
                setPageLoading(false);
            }
        };
        fetchDetails();
    }, [itemId, navigate]);

    // Load Razorpay Script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const calculateBreakdown = useCallback(() => {
        if (!startDate || !endDate || !product) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end - start;
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (days <= 0) return { error: 'End date must be after start date' };

        const subtotal = days * parseFloat(product.price_per_day_inr);
        const serviceFee = subtotal * serviceFeeRate;
        const tax = subtotal * taxRate;

        let deliveryFee = 0;
        if (deliveryMethod === 'delivery') {
            deliveryFee = parseFloat(product.delivery_fee_inr || 0);
        }

        const total = subtotal + serviceFee + tax + deliveryFee;

        return { days, subtotal, serviceFee, tax, deliveryFee, total };
    }, [startDate, endDate, product, deliveryMethod]);

    const breakdown = calculateBreakdown();

    const handlePayment = async (bookingId, amount) => {
        const res = await loadRazorpayScript();

        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            setLoading(true);
            // 1. Create Order on Backend
            const orderData = await paymentService.createOrder(bookingId, amount);

            // DEMO MODE BYPASS: If order is a mock, simulate success
            if (orderData.id.startsWith('order_mock_')) {
                toast.info('DEMO MODE: Simulating payment success...', { autoClose: 2000 });
                setTimeout(async () => {
                    try {
                        await paymentService.verifyPayment({
                            razorpay_order_id: orderData.id,
                            razorpay_payment_id: 'pay_mock_' + Date.now(),
                            razorpay_signature: 'mock_sig',
                            bookingId,
                            amount
                        });
                        setShowSuccess(true);
                        setTimeout(() => navigate('/dashboard/bookings'), 4000);
                    } catch (err) {
                        toast.error(err.message || 'Demo verification failed');
                    } finally {
                        setLoading(false);
                    }
                }, 1500);
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Rental Platform',
                description: `Booking for ${product.item_name}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        setLoading(true);
                        // 2. Verify Payment on Backend
                        await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId,
                            amount
                        });
                        setShowSuccess(true);
                        setTimeout(() => navigate('/dashboard/bookings'), 4000);
                    } catch (err) {
                        toast.error(err.message || 'Payment verification failed');
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: '', // Optional: Fill from user profile
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#059669' // emerald-600
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        toast.info('Payment cancelled. Your booking is still saved as pending.');
                        navigate('/dashboard/bookings');
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            setLoading(false);
            toast.error(err.message || 'Failed to initiate payment');
        }
    };

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
            // 1. Create Pending Booking
            const booking = await createBooking({
                itemId, // This is si.item_id or si.id depending on what si is
                shopId: product.shop_id,
                startDate,
                endDate,
                totalAmount: breakdown.total,
                deliveryMethod,
                deliveryFee: breakdown.deliveryFee,
                address: deliveryMethod === 'delivery' ? address : null
            });

            // 2. Start Razorpay Flow
            await handlePayment(booking.booking_id, breakdown.total);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create booking');
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <p className="text-gray-500 font-bold animate-pulse">Loading item details...</p>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 animate-fade-in">
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-emerald-100 flex flex-col items-center text-center p-12 sm:p-20 relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-10 shadow-inner group">
                        <CheckCircle className="w-12 h-12 text-emerald-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="space-y-6 max-w-2xl">
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">Booking Confirmed!</h2>
                        <p className="text-gray-500 text-lg sm:text-xl font-medium leading-relaxed">
                            Excellent choice! Your rental for <span className="text-emerald-600 font-black border-b-2 border-emerald-200 pb-0.5">{product.item_name}</span> has been successfully processed and confirmed.
                        </p>
                    </div>

                    <div className="mt-12 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-6 rounded-3xl text-left border border-gray-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                            <p className="text-emerald-700 font-black">Payment Verified</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-3xl text-left border border-gray-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Next Step</p>
                            <p className="text-gray-900 font-black">Pickup/Delivery Setup</p>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-gray-50 w-full flex flex-col items-center gap-6">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-colors active:scale-95 cursor-pointer" onClick={() => navigate('/dashboard/bookings')}>
                            View My Bookings <ArrowRight size={18} />
                        </div>
                        <p className="text-xs text-gray-400 font-bold flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" /> Redirecting to your rentals in a few seconds...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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
                            <img src={product.image_url || 'https://placehold.co/800x600?text=Premium+Item'} alt={product.item_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-emerald-700 text-xs font-black shadow-lg">
                                <Star size={14} className="mr-1 fill-emerald-600 text-emerald-600" />
                                {product.avg_rating || '5.0'}
                            </div>
                        </div>
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{product.item_name}</h2>
                            <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">{product.item_description}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Offered by</p>
                                        <p className="text-sm font-black text-gray-900">{product.shop_name}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                            <Star size={10} className="fill-emerald-600" /> {product.shop_rating} Shop Rating
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-emerald-600">₹{product.price_per_day_inr}</p>
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
                                        disabled={!product.delivery_available}
                                        onClick={() => setDeliveryMethod('delivery')}
                                        className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all duration-300 ${!product.delivery_available ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${deliveryMethod === 'delivery'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xl shadow-emerald-100 scale-105'
                                            : 'border-gray-50 hover:border-emerald-100 text-gray-400'
                                            }`}
                                    >
                                        <div className={`p-4 rounded-2xl ${deliveryMethod === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                                            <Truck size={28} />
                                        </div>
                                        <span className="font-black text-lg">Doorstep Delivery</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{product.delivery_available ? `₹${product.delivery_fee_inr} Fee` : 'Not Supported'}</span>
                                    </button>
                                </div>

                                {!product.delivery_available && (
                                    <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl flex items-start gap-4 animate-slide-up">
                                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 text-orange-600">
                                            <Truck size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-orange-900 text-sm">Delivery is not available for this item</p>
                                            <p className="text-orange-700 text-xs font-medium leading-relaxed">
                                                This shop ({product.shop_name}) currently only offers "Self Pickup" for this specific item. You can find their address below in the item details.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {deliveryMethod === 'delivery' && product.delivery_available && (
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
                                            Select address for delivery from {product.shop_name}
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
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-[2rem] text-xl font-black shadow-2xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                                >
                                    {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                                    <span className="group-hover:tracking-widest transition-all duration-300">
                                        {loading ? 'Processing Transaction...' : `Confirm & Pay • ₹${breakdown?.total?.toFixed(2) || '0.00'}`}
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
