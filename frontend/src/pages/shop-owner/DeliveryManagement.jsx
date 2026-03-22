import React, { useState, useEffect, useCallback } from 'react';
import deliveryService from '../../services/deliveryService';
import { Truck, Package, CheckCircle, MapPin, Phone, Clock, User, RefreshCw, Loader2, AlertTriangle, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_LABELS = {
    pending: 'Preparing',
    assigned: 'Agent Assigned',
    picked_up: 'Picked Up',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    failed: 'Failed',
};

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    picked_up: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    out_for_delivery: 'bg-violet-100 text-violet-800 border-violet-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
};

// The allowed next status from each current status
const NEXT_STATUS_MAP = {
    pending: { label: 'Mark as Assigned', next: 'assigned', color: 'bg-blue-600 hover:bg-blue-700' },
    assigned: { label: 'Mark as Picked Up', next: 'picked_up', color: 'bg-indigo-600 hover:bg-indigo-700' },
    picked_up: { label: 'Mark Out for Delivery', next: 'out_for_delivery', color: 'bg-violet-600 hover:bg-violet-700' },
    out_for_delivery: { label: 'Mark as Delivered ✅', next: 'delivered', color: 'bg-emerald-600 hover:bg-emerald-700' },
};

const FILTER_TABS = [
    { key: 'all', label: 'All Active' },
    { key: 'pending', label: 'Preparing' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
];

const DeliveryManagement = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDeliveries = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError(null);
        try {
            const data = await deliveryService.getShopDeliveries(activeFilter);
            setDeliveries(data);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to load deliveries';
            setError(msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);

    const handleStatusUpdate = async (bookingId, newStatus, itemName) => {
        if (!window.confirm(`Mark delivery for "${itemName}" as "${STATUS_LABELS[newStatus]}"?`)) return;
        setUpdatingId(bookingId);
        try {
            await deliveryService.updateDeliveryStatus(bookingId, newStatus);
            toast.success(`Delivery marked as "${STATUS_LABELS[newStatus]}"!`);
            fetchDeliveries(true);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-gray-500 font-bold">Loading deliveries...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Delivery Management</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage and track all your shop's delivery orders</p>
                </div>
                <button onClick={() => fetchDeliveries(true)} disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-300 hover:text-emerald-600 transition-all disabled:opacity-50">
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {FILTER_TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeFilter === tab.key
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-6 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-red-500" />
                    <p className="text-red-700 dark:text-red-400 font-bold text-sm">{error}</p>
                </div>
            )}

            {/* Deliveries List */}
            {!error && deliveries.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800/60 p-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-black text-gray-700 dark:text-gray-300">No deliveries found</h3>
                    <p className="text-gray-400 text-sm mt-2">There are no delivery orders matching this filter.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {deliveries.map((delivery) => {
                        const img = delivery.item_image
                            ? (delivery.item_image.startsWith('http') ? delivery.item_image : `${BACKEND_URL}${delivery.item_image}`)
                            : 'https://placehold.co/400x300/1E293B/64748B?text=Item';
                        const nextAction = NEXT_STATUS_MAP[delivery.status];
                        const isUpdating = updatingId === delivery.booking_id;

                        return (
                            <div key={delivery.id}
                                className="bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Item Image */}
                                    <div className="w-full sm:w-36 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
                                        <img src={img} alt={delivery.item_name} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 p-6">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div>
                                                <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg">{delivery.item_name}</h3>
                                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${STATUS_COLORS[delivery.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                        {STATUS_LABELS[delivery.status] || delivery.status}
                                                    </span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        Booking #{delivery.booking_id}
                                                    </span>
                                                </div>
                                            </div>
                                            {nextAction && (
                                                <button
                                                    onClick={() => handleStatusUpdate(delivery.booking_id, nextAction.next, delivery.item_name)}
                                                    disabled={isUpdating}
                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-[11px] font-black uppercase tracking-wider ${nextAction.color} shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                    {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={12} />}
                                                    {isUpdating ? 'Updating...' : nextAction.label}
                                                </button>
                                            )}
                                            {delivery.status === 'delivered' && (
                                                <span className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                                                    <CheckCircle size={12} /> Completed
                                                </span>
                                            )}
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                <User size={12} className="text-emerald-500 flex-shrink-0" />
                                                <div>
                                                    <p className="font-black text-gray-800 dark:text-gray-200">{delivery.customer_name}</p>
                                                    {delivery.customer_phone && <p className="text-[10px]">{delivery.customer_phone}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                <MapPin size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                                <p className="leading-tight">{delivery.delivery_address}</p>
                                            </div>
                                            {delivery.estimated_delivery_at && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                    <Clock size={12} className="text-amber-500 flex-shrink-0" />
                                                    <p>ETA: {new Date(delivery.estimated_delivery_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DeliveryManagement;
