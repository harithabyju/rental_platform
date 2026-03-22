import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
import { getShopItemDetails } from '../services/dashboardService';
import paymentService from '../services/paymentService';
import deliveryService from '../services/deliveryService';
import { MapPin, Truck, Box, Star, Loader2, CheckCircle, CreditCard, ArrowRight, Clock, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import ReviewList from '../components/ReviewList';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const BookingPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();

    // Data State
    const [product, setProduct] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Booking State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdBookingId, setCreatedBookingId] = useState(null);

    // Delivery address state
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryCity, setDeliveryCity] = useState('');
    const [deliveryPincode, setDeliveryPincode] = useState('');

    // Delivery options state
    const [deliveryOptions, setDeliveryOptions] = useState(null);
    const [selectedDeliveryType, setSelectedDeliveryType] = useState('standard');
    const [fetchingOptions, setFetchingOptions] = useState(false);
    const [deliveryOptionsError, setDeliveryOptionsError] = useState(null);
    const optionsFetchTimer = useRef(null);

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

    // Fetch delivery options when city is entered (debounced)
    useEffect(() => {
        if (deliveryMethod !== 'delivery' || !product || !deliveryCity.trim()) {
            setDeliveryOptions(null);
            return;
        }
        if (optionsFetchTimer.current) clearTimeout(optionsFetchTimer.current);
        optionsFetchTimer.current = setTimeout(async () => {
            setFetchingOptions(true);
            setDeliveryOptionsError(null);
            try {
                const data = await deliveryService.getDeliveryOptions(product.shop_id, null, null);
                setDeliveryOptions(data);
                // Default to standard
                if (data.options?.length > 0) {
                    setSelectedDeliveryType(data.options[0].type);
                }
            } catch (err) {
                setDeliveryOptionsError('Could not fetch delivery options. Using shop default.');
            } finally {
                setFetchingOptions(false);
            }
        }, 600);
        return () => clearTimeout(optionsFetchTimer.current);
    }, [deliveryCity, deliveryMethod, product]);

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

    // Get currently selected delivery option details
    const getSelectedOption = useCallback(() => {
        if (!deliveryOptions?.options) return null;
        return deliveryOptions.options.find(o => o.type === selectedDeliveryType) || deliveryOptions.options[0];
    }, [deliveryOptions, selectedDeliveryType]);

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
        let deliveryEta = null;
        if (deliveryMethod === 'delivery') {
            const selectedOption = getSelectedOption();
            if (selectedOption) {
                deliveryFee = selectedOption.fee;
                deliveryEta = selectedOption.estimatedHours;
            } else {
                deliveryFee = parseFloat(product.delivery_fee_inr || 0);
            }
        }

        const total = subtotal + serviceFee + tax + deliveryFee;
        return { days, subtotal, serviceFee, tax, deliveryFee, total, deliveryEta };
    }, [startDate, endDate, product, deliveryMethod, getSelectedOption]);

    const breakdown = calculateBreakdown();

    const handlePayment = async (bookingId, amount) => {
        if (import.meta.env.VITE_RAZORPAY_KEY_ID === 'rzp_test_your_key_id' || !import.meta.env.VITE_RAZORPAY_KEY_ID) {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 2000));
                setCreatedBookingId(bookingId);
                setShowSuccess(true);
                toast.success('Mock Payment Successful!');
                setTimeout(() => navigate('/dashboard/bookings'), 5000);
            } catch (err) {
                toast.error('Mock payment simulation failed');
            } finally {
                setLoading(false);
            }
            return;
        }

        const res = await loadRazorpayScript();
        if (!res) { toast.error('Razorpay SDK failed to load.'); return; }

        try {
            setLoading(true);
            const orderData = await paymentService.createOrder(bookingId, amount);
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Rental Platform',
                description: `Booking for ${product.item_name}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        setLoading(true);
                        await paymentService.verifyPayment({ ...response, bookingId, amount });
                        setCreatedBookingId(bookingId);
                        setShowSuccess(true);
                        setTimeout(() => navigate('/dashboard/bookings'), 5000);
                    } catch (err) {
                        toast.error(err.message || 'Payment verification failed');
                    } finally { setLoading(false); }
                },
                prefill: { name: '', email: '', contact: '' },
                theme: { color: '#059669' },
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

        if (breakdown?.error) { setError(breakdown.error); setLoading(false); return; }

        if (deliveryMethod === 'delivery') {
            if (!deliveryAddress.trim()) { setError('Please enter a delivery street address'); setLoading(false); return; }
            if (!deliveryCity.trim()) { setError('Please enter a delivery city'); setLoading(false); return; }
            if (deliveryOptions?.outOfRange) { setError('Your location is out of delivery range for this shop.'); setLoading(false); return; }
        }

        try {
            const booking = await createBooking({
                itemId,
                shopId: product.shop_id,
                startDate,
                endDate,
                totalAmount: breakdown.total,
                deliveryMethod,
                deliveryFee: breakdown.deliveryFee,
                address: deliveryMethod === 'delivery' ? `${deliveryAddress}, ${deliveryCity}${deliveryPincode ? ' - ' + deliveryPincode : ''}` : null,
                deliveryCity: deliveryMethod === 'delivery' ? deliveryCity : null,
                deliveryLat: null,
                deliveryLng: null,
            });

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
                <div className="bg-white dark:bg-[#111827] rounded-[3rem] shadow-2xl overflow-hidden border border-emerald-100 flex flex-col items-center text-center p-12 sm:p-20 relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-10 shadow-inner">
                        <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div className="space-y-6 max-w-2xl">
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Booking Confirmed!</h2>
                        <p className="text-gray-500 text-lg sm:text-xl font-medium leading-relaxed">
                            Your rental for <span className="text-emerald-600 font-black border-b-2 border-emerald-200 pb-0.5">{product.item_name}</span> has been successfully processed.
                        </p>
                    </div>

                    <div className="mt-12 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-3xl text-left border border-gray-100 dark:border-gray-800/60">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</p>
                            <p className="text-emerald-700 font-black">Payment Verified ✓</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-3xl text-left border border-gray-100 dark:border-gray-800/60">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Delivery</p>
                            <p className="text-gray-900 dark:text-gray-100 font-black">
                                {deliveryMethod === 'delivery' ? '🚚 Doorstep Delivery Scheduled' : '📦 Self Pickup'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                        {deliveryMethod === 'delivery' && createdBookingId && (
                            <button
                                onClick={() => navigate(`/dashboard/delivery/${createdBookingId}`)}
                                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-1 transition-all"
                            >
                                <Truck size={18} /> Track My Delivery <ArrowRight size={16} />
                            </button>
                        )}
                        <div
                            className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 dark:bg-white/10 text-white rounded-2xl text-sm font-black hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={() => navigate('/dashboard/bookings')}
                        >
                            View My Bookings <ArrowRight size={18} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-bold flex items-center gap-2 mt-8">
                        <Loader2 className="w-3 h-3 animate-spin" /> Redirecting to your rentals in a few seconds...
                    </p>
                </div>
            </div>
        );
    }

    const selectedOption = getSelectedOption();

    return (
        <div className="max-w-6xl mx-auto py-12 animate-fade-in px-4">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Finalize Reservation</h1>
                <p className="text-gray-500 font-medium mt-2">Check details and enter your preferences below</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* LEFT COLUMN: Product Details */}
                <div className="lg:col-span-1 space-y-8 animate-slide-up">
                    <div className="card overflow-hidden group shadow-2xl shadow-gray-100">
                        <div className="relative h-72 overflow-hidden">
                            <img
                                src={product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `${BACKEND_URL}${product.image_url}`) : 'https://placehold.co/800x600?text=Premium+Item'}
                                alt={product.item_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 right-4 flex items-center bg-white dark:bg-[#111827]/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-emerald-700 text-xs font-black shadow-lg">
                                <Star size={14} className={`mr-1 ${parseFloat(product.avg_rating) > 0 ? 'fill-emerald-600 text-emerald-600' : 'text-gray-700 dark:text-gray-300'}`} />
                                {parseFloat(product.avg_rating) > 0 ? parseFloat(product.avg_rating).toFixed(1) : 'New'}
                            </div>
                        </div>
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2 leading-tight">{product.item_name}</h2>
                            <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">{product.item_description}</p>
                            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800/60">
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Offered by</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-gray-100">{product.shop_name}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                        <Star size={10} className="fill-emerald-600" /> {product.shop_rating} Shop Rating
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-emerald-600">₹{product.price_per_day_inr}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase">per day</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ReviewList itemId={product.item_id} />
                </div>

                {/* RIGHT COLUMN: Booking Form */}
                <div className="lg:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="card p-10">
                        <form onSubmit={handleSubmit} className="space-y-12">
                            {error && (
                                <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl text-red-700 animate-scale-up flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <p className="font-bold">{error}</p>
                                </div>
                            )}

                            {/* Section 1: Dates */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-200">1</div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">When do you need it?</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Pick-up / Start Date</label>
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                            className="input-field py-4 focus:ring-4 focus:ring-emerald-50" required
                                            min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Return Date</label>
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                            className="input-field py-4 focus:ring-4 focus:ring-emerald-50" required
                                            min={startDate || new Date().toISOString().split('T')[0]} />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Delivery Method */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-200">2</div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">How will you get it?</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Self Pickup */}
                                    <button type="button" onClick={() => setDeliveryMethod('pickup')}
                                        className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all duration-300 ${deliveryMethod === 'pickup'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xl shadow-emerald-100 scale-105'
                                            : 'border-gray-50 hover:border-emerald-100 text-gray-500 dark:text-gray-400'}`}>
                                        <div className={`p-4 rounded-2xl ${deliveryMethod === 'pickup' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'} transition-colors`}>
                                            <Box size={28} />
                                        </div>
                                        <span className="font-black text-lg">Self Pickup</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Always Free</span>
                                        <span className="text-xs text-center opacity-70">Visit the shop at {product.shop_name}</span>
                                    </button>

                                    {/* Doorstep Delivery */}
                                    <button type="button" disabled={!product.delivery_available}
                                        onClick={() => setDeliveryMethod('delivery')}
                                        className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all duration-300 ${!product.delivery_available ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${deliveryMethod === 'delivery'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xl shadow-emerald-100 scale-105'
                                            : 'border-gray-50 hover:border-emerald-100 text-gray-500 dark:text-gray-400'}`}>
                                        <div className={`p-4 rounded-2xl ${deliveryMethod === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'} transition-colors`}>
                                            <Truck size={28} />
                                        </div>
                                        <span className="font-black text-lg">Doorstep Delivery</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {product.delivery_available ? 'From ₹' + (selectedOption?.fee || product.delivery_fee_inr || '0') : 'Not Available'}
                                        </span>
                                        <span className="text-xs text-center opacity-70">Delivered to your address</span>
                                    </button>
                                </div>

                                {/* Delivery Not Available Warning */}
                                {!product.delivery_available && (
                                    <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl flex items-start gap-4 animate-slide-up">
                                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 text-orange-600"><Truck size={20} /></div>
                                        <div className="space-y-1">
                                            <p className="font-black text-orange-900 text-sm">Delivery not available for this item</p>
                                            <p className="text-orange-700 text-xs font-medium leading-relaxed">
                                                {product.shop_name} currently offers "Self Pickup" only for this item.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Address Form */}
                                {deliveryMethod === 'delivery' && product.delivery_available && (
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-[2rem] border-2 border-emerald-100/50 animate-scale-up space-y-6">
                                        <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                                            <MapPin size={16} className="text-emerald-600" /> Enter Delivery Address
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Street Address *</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                                                    <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}
                                                        placeholder="House No., Street, Area..."
                                                        className="input-field pl-12 py-4 border-2 border-emerald-100 focus:border-emerald-500 focus:ring-0" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">City *</label>
                                                    <input type="text" value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)}
                                                        placeholder="e.g. New Delhi" className="input-field py-4 border-2 border-emerald-100 focus:border-emerald-500 focus:ring-0" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Pincode</label>
                                                    <input type="text" value={deliveryPincode} onChange={(e) => setDeliveryPincode(e.target.value)}
                                                        placeholder="e.g. 110001" className="input-field py-4 border-2 border-emerald-100 focus:border-emerald-500 focus:ring-0" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery Options Selector */}
                                        {fetchingOptions && (
                                            <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
                                                <Loader2 size={14} className="animate-spin" /> Calculating delivery options...
                                            </div>
                                        )}

                                        {deliveryOptions && !fetchingOptions && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Choose Delivery Speed</p>
                                                {deliveryOptions.outOfRange ? (
                                                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                                                        <AlertTriangle size={16} className="text-red-500" />
                                                        <p className="text-red-700 text-sm font-bold">{deliveryOptions.note}</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {deliveryOptions.options.map((option) => (
                                                            <button key={option.type} type="button"
                                                                disabled={!option.available}
                                                                onClick={() => setSelectedDeliveryType(option.type)}
                                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${!option.available ? 'opacity-40 cursor-not-allowed' : ''} ${selectedDeliveryType === option.type
                                                                    ? 'border-emerald-500 bg-white shadow-lg'
                                                                    : 'border-emerald-100 bg-white/60 hover:border-emerald-300'}`}>
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className="flex items-center gap-2 font-black text-sm text-emerald-800">
                                                                        {option.type === 'express' ? <Zap size={14} className="text-amber-500" /> : <Truck size={14} className="text-emerald-600" />}
                                                                        {option.label}
                                                                    </div>
                                                                    <span className="font-black text-emerald-700">₹{option.fee}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                                                                    <Clock size={11} /> ~{option.estimatedHours}h ETA
                                                                </div>
                                                                <p className="text-[10px] text-gray-500 mt-1">{option.description}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {deliveryOptions.distanceKm && (
                                                    <p className="text-xs text-emerald-700 font-bold mt-2 flex items-center gap-1">
                                                        <MapPin size={11} /> ~{deliveryOptions.distanceKm} km from {deliveryOptions.shopName || product.shop_name}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {deliveryOptionsError && (
                                            <p className="text-xs text-orange-600 font-bold">{deliveryOptionsError}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown & Submit */}
                            <div className="pt-12 border-t border-gray-100 dark:border-gray-800/60">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Price Breakdown</h3>
                                    <div className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Currency: INR (₹)
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800/40/50 rounded-[2rem] p-8 space-y-5 mb-10 border border-gray-100 dark:border-gray-800/60">
                                    {breakdown && !breakdown.error ? (
                                        <>
                                            <div className="flex justify-between items-center text-gray-500">
                                                <span className="font-bold">Rental Amount ({breakdown.days} days)</span>
                                                <span className="font-black text-gray-900 dark:text-gray-100 text-lg">₹{breakdown.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-500">
                                                <span className="font-bold">Service & Protection Fee</span>
                                                <span className="font-black text-gray-900 dark:text-gray-100 text-lg">₹{breakdown.serviceFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-500">
                                                <span className="font-bold">GST & Taxes (5%)</span>
                                                <span className="font-black text-gray-900 dark:text-gray-100 text-lg">₹{breakdown.tax.toFixed(2)}</span>
                                            </div>
                                            {deliveryMethod === 'delivery' && (
                                                <div className="flex justify-between items-center text-emerald-700">
                                                    <span className="font-black flex items-center gap-2">
                                                        <Truck size={18} /> {selectedOption?.label || 'Delivery Charges'}
                                                        {breakdown.deliveryEta && <span className="text-[10px] font-bold opacity-70">~{breakdown.deliveryEta}h</span>}
                                                    </span>
                                                    <span className="font-black text-lg">₹{breakdown.deliveryFee.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="h-px bg-gray-200 mt-4" />
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-xl font-black text-gray-900 dark:text-gray-100">Total Payable</span>
                                                <div className="text-right">
                                                    <span className="text-4xl font-black text-emerald-600 tracking-tighter">₹{breakdown.total.toFixed(2)}</span>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mt-1 italic">All inclusive</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-500 dark:text-gray-400 font-bold italic py-8">
                                            Please select rental dates to calculate your total
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={loading || !breakdown || breakdown.error}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-[2rem] text-xl font-black shadow-2xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group flex items-center justify-center gap-3">
                                    {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                                    <span className="group-hover:tracking-widest transition-all duration-300">
                                        {loading ? 'Processing Transaction...' : `Confirm & Pay • ₹${breakdown?.total?.toFixed(2) || '0.00'}`}
                                    </span>
                                </button>
                                <p className="text-center text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.2em] mt-6">
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
