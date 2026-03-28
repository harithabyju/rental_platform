import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import deliveryService from '../services/deliveryService';
import { Truck, Package, CheckCircle, MapPin, Phone, Clock, ArrowLeft, RefreshCw, Loader2, AlertTriangle, User } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STEP_ICONS = {
    confirmed: '🎉',
    pending: '📦',
    assigned: '👤',
    picked_up: '🚗',
    out_for_delivery: '🛣️',
    delivered: '✅',
};

const STATUS_LABELS = {
    pending: 'Preparing',
    assigned: 'Agent Assigned',
    picked_up: 'Picked Up',
    out_for_delivery: 'On the Way',
    delivered: 'Delivered',
    failed: 'Failed',
};

const DeliveryTrackerPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStatus = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError(null);
        try {
            const result = await deliveryService.getDeliveryStatus(bookingId);
            setData(result);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to load delivery status';
            setError(msg);
            if (!silent) toast.error(msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [bookingId]);

    useEffect(() => {
        fetchStatus();
        // Poll every 30 seconds for status updates
        const interval = setInterval(() => fetchStatus(true), 30000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <p className="text-gray-500 font-bold animate-pulse">Loading delivery status...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-3xl p-12">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-red-800 dark:text-red-300 mb-2">Delivery Info Unavailable</h2>
                    <p className="text-red-600 dark:text-red-400 mb-6 font-medium">{error}</p>
                    <button onClick={() => navigate('/dashboard/bookings')}
                        className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-600 text-white rounded-2xl font-black hover:bg-red-500 transition-colors">
                        <ArrowLeft size={16} /> Back to Bookings
                    </button>
                </div>
            </div>
        );
    }

    const { deliveryOrder: order, timeline, currentStatus, isFailed } = data;

    const getStatusBg = (status) => {
        if (isFailed) return 'bg-red-500';
        if (status === 'delivered') return 'bg-emerald-600';
        if (['out_for_delivery', 'picked_up'].includes(status)) return 'bg-blue-600';
        return 'bg-amber-500';
    };

    const itemImg = order.item_image
        ? (order.item_image.startsWith('http') ? order.item_image : `${BACKEND_URL}${order.item_image}`)
        : 'https://placehold.co/400x300/1E293B/64748B?text=No+Image';

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/dashboard/bookings')}
                    className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 font-bold transition-colors">
                    <ArrowLeft size={18} /> My Bookings
                </button>
                <button onClick={() => fetchStatus(true)} disabled={refreshing}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-500 font-bold text-sm transition-colors disabled:opacity-50">
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Status Banner */}
            <div className={`${getStatusBg(currentStatus)} text-white rounded-[2rem] p-8 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                    <div className="w-64 h-64 rounded-full bg-white absolute -top-20 -right-20" />
                    <div className="w-40 h-40 rounded-full bg-white absolute -bottom-10 -left-10" />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="text-4xl mb-2">{STEP_ICONS[currentStatus] || '📦'}</div>
                        <p className="text-white/80 text-sm font-bold uppercase tracking-widest">Delivery Status</p>
                        <h1 className="text-3xl font-black mt-1">
                            {isFailed ? '⚠️ Delivery Failed' : STATUS_LABELS[currentStatus] || currentStatus}
                        </h1>
                        {currentStatus === 'out_for_delivery' && (
                            <p className="text-white/90 font-medium mt-2 text-sm">Your item is on its way! ETA may vary.</p>
                        )}
                        {currentStatus === 'delivered' && (
                            <p className="text-white/90 font-medium mt-2 text-sm">Successfully delivered to your address ✓</p>
                        )}
                    </div>
                    {/* Item thumbnail */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/30 flex-shrink-0">
                        <img src={itemImg} alt={order.item_name} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-gray-800/60 p-8 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-8 tracking-tight">Delivery Timeline</h2>
                <div className="space-y-0">
                    {timeline.map((step, idx) => (
                        <div key={step.key} className="flex gap-4 relative">
                            {/* Connector line */}
                            {idx < timeline.length - 1 && (
                                <div className={`absolute left-5 top-10 w-0.5 h-12 transition-colors duration-500 ${step.completed ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            )}
                            {/* Step icon */}
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 text-lg transition-all duration-500 ${step.completed
                                ? step.active
                                    ? `${getStatusBg(currentStatus)} shadow-lg scale-110`
                                    : 'bg-emerald-100 dark:bg-emerald-900/30'
                                : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                {step.completed ? (
                                    step.active ? (
                                        <span className="text-sm">{STEP_ICONS[step.key] || '•'}</span>
                                    ) : (
                                        <CheckCircle size={18} className="text-emerald-600" />
                                    )
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                                )}
                            </div>
                            {/* Step content */}
                            <div className={`pb-8 flex-1 ${step.active ? 'opacity-100' : step.completed ? 'opacity-80' : 'opacity-40'}`}>
                                <p className={`font-black text-sm ${step.active ? 'text-gray-900 dark:text-gray-100' : step.completed ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'}`}>
                                    {step.label}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{step.description}</p>
                                {step.active && ['out_for_delivery'].includes(currentStatus) && step.key === 'out_for_delivery' && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> LIVE
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delivery Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Delivery Address */}
                <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-gray-800/60 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                            <MapPin size={18} className="text-emerald-600" />
                        </div>
                        <h3 className="font-black text-gray-900 dark:text-gray-100 text-sm">Delivery Address</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-sm leading-relaxed ml-1">
                        {order.delivery_address || 'Address not provided'}
                    </p>
                    {order.delivery_city && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{order.delivery_city}</p>
                    )}
                </div>

                {/* Delivery Agent */}
                <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-gray-800/60 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                            <User size={18} className="text-blue-600" />
                        </div>
                        <h3 className="font-black text-gray-900 dark:text-gray-100 text-sm">Delivery Agent</h3>
                    </div>
                    {order.agent_name ? (
                        <div className="space-y-2 ml-1">
                            <p className="font-black text-gray-800 dark:text-gray-200">{order.agent_name}</p>
                            {order.agent_phone && (
                                <a href={`tel:${order.agent_phone}`}
                                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-500 font-bold text-sm transition-colors">
                                    <Phone size={13} /> {order.agent_phone}
                                </a>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm font-medium ml-1">Will be assigned soon</p>
                    )}
                </div>

                {/* ETA */}
                {order.estimated_delivery_at && currentStatus !== 'delivered' && (
                    <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-gray-800/60 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                                <Clock size={18} className="text-amber-600" />
                            </div>
                            <h3 className="font-black text-gray-900 dark:text-gray-100 text-sm">Estimated Delivery</h3>
                        </div>
                        <p className="font-black text-gray-800 dark:text-gray-200 ml-1">
                            {new Date(order.estimated_delivery_at).toLocaleString('en-IN', {
                                weekday: 'short', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                )}

                {/* Delivered At */}
                {order.delivered_at && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-200 dark:bg-emerald-800/50 rounded-2xl flex items-center justify-center">
                                <CheckCircle size={18} className="text-emerald-600" />
                            </div>
                            <h3 className="font-black text-emerald-900 dark:text-emerald-300 text-sm">Delivered On</h3>
                        </div>
                        <p className="font-black text-emerald-800 dark:text-emerald-200 ml-1">
                            {new Date(order.delivered_at).toLocaleString('en-IN', {
                                weekday: 'short', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                )}

                {/* Item & Shop Info */}
                <div className="sm:col-span-2 bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-gray-800/60 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                            <img src={itemImg} alt={order.item_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg">{order.item_name}</h3>
                            <div className="flex flex-wrap gap-3 mt-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-bold">
                                    <Package size={12} className="text-emerald-500" /> {order.shop_name}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-bold">
                                    <MapPin size={12} className="text-emerald-500" /> {order.shop_city}
                                </div>
                                {order.estimated_fee_inr > 0 && (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                                        <Truck size={12} /> Delivery: ₹{order.estimated_fee_inr}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider 
                                    ${currentStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                        currentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                                    {isFailed ? 'Failed' : STATUS_LABELS[currentStatus] || currentStatus}
                                </span>
                                <span className="text-xs text-gray-400 font-bold">Booking #{bookingId}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-refresh note */}
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Status auto-refreshes every 30 seconds
            </p>
        </div>
    );
};

export default DeliveryTrackerPage;
