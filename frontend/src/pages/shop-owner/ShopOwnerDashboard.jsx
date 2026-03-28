import { useState, useEffect, useRef } from 'react';
import { Store, Package, Plus, X, AlertCircle, Clock, XCircle, Edit2, Trash2, Upload, Image as ImageIcon, DollarSign, Tag, CheckCircle, FileText, MapPin, AlertTriangle, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import shopService from '../../services/shop.service';
import itemService from '../../services/item.service';
import * as dashboardService from '../../services/dashboardService';
import * as bookingService from '../../services/bookingService';
import RentalStatusCard from '../../components/RentalStatusCard';
import DeliveryManagement from './DeliveryManagement';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ---------- Sub-components ----------

const StatusBanner = ({ status, onCompleteDetails, hasDetails, onRequestApproval, submittingApproval }) => {
    if (status === 'incomplete') return (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm shadow-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
                <p className="font-bold text-blue-800 text-sm">
                    {hasDetails ? 'Ready for Approval!' : 'Action Required: Complete Verification'}
                </p>
                <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                    {hasDetails
                        ? 'You have provided verification details. You can now submit your shop for admin review.'
                        : 'Please provide your Government ID, Shop License, Bank Details, and verify your address to request admin approval.'}
                </p>
                <div className="flex gap-3 mt-3">
                    <button
                        onClick={onCompleteDetails}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        {hasDetails ? 'Review Details' : 'Complete Details'}
                    </button>
                    {hasDetails && (
                        <button
                            onClick={onRequestApproval}
                            disabled={submittingApproval}
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {submittingApproval ? 'Submitting...' : 'Request Admin Approval'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
    if (status === 'pending') return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
                <p className="font-bold text-amber-800 text-sm">Awaiting Admin Approval</p>
                <p className="text-amber-700 text-sm mt-1">Your shop details are under review. You'll be able to add items once approved.</p>
            </div>
        </div>
    );
    if (status === 'rejected') return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
                <p className="font-bold text-red-800 text-sm">Shop Registration Rejected</p>
                <p className="text-red-700 text-sm mt-1">Your shop was not approved. Please contact the admin for more information.</p>
            </div>
        </div>
    );
    return null;
};

const VerificationOverview = ({ shop, onCompleteDetails }) => {
    const sections = [
        {
            id: 'address',
            label: 'Shop Address',
            status: shop.address ? 'complete' : 'missing',
            desc: shop.address ? `${shop.address}, ${shop.city}` : 'Full business address required'
        },
        {
            id: 'docs',
            label: 'Documents',
            status: (shop.govt_id_url && shop.shop_license_url) ? 'complete' : (shop.govt_id_url || shop.shop_license_url) ? 'partial' : 'missing',
            desc: shop.govt_id_url ? 'Govt ID uploaded' : 'Govt ID & License required'
        },
        {
            id: 'bank',
            label: 'Bank Details',
            status: shop.bank_account_number ? 'complete' : 'missing',
            desc: shop.bank_account_number ? `${shop.bank_name} - ${shop.bank_account_number.slice(-4).padStart(shop.bank_account_number.length, '*')}` : 'Required for payments'
        }
    ];

    const getStatusIcon = (status) => {
        if (status === 'complete') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        if (status === 'partial') return <Clock className="w-4 h-4 text-amber-500" />;
        return <AlertCircle className="w-4 h-4 text-gray-700 dark:text-gray-300" />;
    };

    return (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden mt-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40/50 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Verification Status</h3>
                <button
                    onClick={onCompleteDetails}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                    Edit Details
                </button>
            </div>
            <div className="divide-y divide-gray-50">
                {sections.map(s => (
                    <div key={s.id} className="p-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.status === 'complete' ? 'bg-emerald-50' : s.status === 'partial' ? 'bg-amber-50' : 'bg-gray-50 dark:bg-gray-800/40'
                            }`}>
                            {getStatusIcon(s.status)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-gray-900 dark:text-gray-100">{s.label}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const VerificationForm = ({ shop, onSaved, onCancel }) => {
    const [form, setForm] = useState({
        address: shop.address || '',
        city: shop.city || '',
        state: shop.state || '',
        pincode: shop.pincode || '',
        bank_account_name: shop.bank_account_name || '',
        bank_account_number: shop.bank_account_number || '',
        bank_ifsc: shop.bank_ifsc || '',
        bank_name: shop.bank_name || '',
        working_hours: shop.working_hours || { open: '09:00', close: '18:00', is_24x7: false }
    });
    const [govtId, setGovtId] = useState(null);
    const [shopLicense, setShopLicense] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.keys(form).forEach(key => fd.append(key, form[key]));
            if (govtId) fd.append('govt_id', govtId);
            if (shopLicense) fd.append('shop_license', shopLicense);

            await shopService.updateMyShop(fd);
            toast.success('Verification details saved! Don\'t forget to request admin approval.');
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save details');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">Verification Details</h2>
                    <p className="text-sm text-gray-500">Provide official documents and bank information</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shop Address Section */}
                <div>
                    <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Shop Address
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Full Street Address *</label>
                            <input
                                type="text" required
                                value={form.address}
                                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                                <input
                                    type="text" required
                                    value={form.city}
                                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                    className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">State *</label>
                                <input
                                    type="text" required
                                    value={form.state}
                                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                                    className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Pincode *</label>
                                <input
                                    type="text" required
                                    value={form.pincode}
                                    onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                                    className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Working Hours Section */}
                <div className="pt-4 border-t border-gray-50 text-emerald-800">
                    <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Working Hours
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.working_hours?.is_24x7}
                                    onChange={e => setForm(f => ({ ...f, working_hours: { ...f.working_hours, is_24x7: e.target.checked } }))}
                                    className="w-4 h-4 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Open 24/7
                            </label>
                        </div>
                        {!form.working_hours?.is_24x7 && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">Opening Time *</label>
                                    <input
                                        type="time" required={!form.working_hours?.is_24x7}
                                        value={form.working_hours?.open || '09:00'}
                                        onChange={e => setForm(f => ({ ...f, working_hours: { ...f.working_hours, open: e.target.value } }))}
                                        className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">Closing Time *</label>
                                    <input
                                        type="time" required={!form.working_hours?.is_24x7}
                                        value={form.working_hours?.close || '18:00'}
                                        onChange={e => setForm(f => ({ ...f, working_hours: { ...f.working_hours, close: e.target.value } }))}
                                        className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Documents Section */}
                <div className="pt-4 border-t border-gray-50">
                    <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Government ID *</label>
                            <input
                                type="file" required={!shop.govt_id_url} accept=".pdf,image/*"
                                onChange={e => setGovtId(e.target.files[0])}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {shop.govt_id_url && <p className="text-[10px] text-emerald-600 mt-1 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Already uploaded</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Shop License *</label>
                            <input
                                type="file" required={!shop.shop_license_url} accept=".pdf,image/*"
                                onChange={e => setShopLicense(e.target.files[0])}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {shop.shop_license_url && <p className="text-[10px] text-emerald-600 mt-1 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Already uploaded</p>}
                        </div>
                    </div>
                </div>

                {/* Bank Details Section */}
                <div className="pt-4 border-t border-gray-50">
                    <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Bank Account Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Account Holder Name *</label>
                            <input
                                type="text" required
                                value={form.bank_account_name}
                                onChange={e => setForm(f => ({ ...f, bank_account_name: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Account Number *</label>
                            <input
                                type="text" required
                                value={form.bank_account_number}
                                onChange={e => setForm(f => ({ ...f, bank_account_number: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Bank Name *</label>
                            <input
                                type="text" required
                                value={form.bank_name}
                                onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">IFSC Code *</label>
                            <input
                                type="text" required
                                value={form.bank_ifsc}
                                onChange={e => setForm(f => ({ ...f, bank_ifsc: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button" onClick={onCancel}
                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700/60 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 dark:bg-gray-800/40 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit" disabled={submitting}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
                    >
                        {submitting ? 'Saving...' : 'Save Details'}
                    </button>
                </div>
            </form>
        </div >
    );
};

const UnifiedShopRegisterForm = ({ onRegistered }) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        latitude: '',
        longitude: '',
        bank_account_name: '',
        bank_account_number: '',
        bank_ifsc: '',
        bank_name: '',
        working_hours: { open: '09:00', close: '18:00', is_24x7: false }
    });
    const [govtId, setGovtId] = useState(null);
    const [shopLicense, setShopLicense] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.keys(form).forEach(key => fd.append(key, form[key]));
            if (govtId) fd.append('govt_id', govtId);
            if (shopLicense) fd.append('shop_license', shopLicense);

            const shop = await shopService.registerShop(fd);
            toast.success('Shop registered! Awaiting admin approval.');
            onRegistered(shop);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">Register Your Business</h2>
                    <p className="text-sm text-gray-500">Provide all details to skip manual verification later</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Basic Information */}
                <section>
                    <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">Shop Name *</label>
                            <input
                                type="text" required
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Business Name"
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">Phone *</label>
                            <input
                                type="text" required
                                value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                placeholder="Phone number"
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">Description</label>
                            <textarea
                                rows={2} value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Tell us about your business..."
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* 2. Location & Address */}
                <section>
                    <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Location Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">Full Address *</label>
                            <input
                                type="text" required
                                value={form.address}
                                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                placeholder="Street, Locality"
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <input
                                type="text" required placeholder="City"
                                value={form.city}
                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text" required placeholder="State"
                                value={form.state}
                                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text" required placeholder="Pincode"
                                value={form.pincode}
                                onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number" step="any" required placeholder="Latitude"
                                value={form.latitude}
                                onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="number" step="any" required placeholder="Longitude"
                                value={form.longitude}
                                onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Working Hours Section */}
                <section>
                    <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Clock className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Working Hours
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                        <div className="col-span-full mb-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.working_hours?.is_24x7}
                                    onChange={e => setForm(f => ({ ...f, working_hours: { ...f.working_hours, is_24x7: e.target.checked } }))}
                                    className="w-4 h-4 rounded-lg border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                Open 24/7
                            </label>
                        </div>
                        {!form.working_hours?.is_24x7 && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase">Opening Time *</label>
                                    <input
                                        type="time" required={!form.working_hours?.is_24x7}
                                        value={form.working_hours?.open || '09:00'}
                                        onChange={e => setForm(f => ({ ...f, working_hours: { ...f.working_hours, open: e.target.value } }))}
                                        className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase">Closing Time *</label>
                                    <input
                                        type="time" required={!form.working_hours?.is_24x7}
                                        value={form.working_hours?.close || '18:00'}
                                        onChange={e => setForm(f => ({ ...f, working_hours: { ...f.working_hours, close: e.target.value } }))}
                                        className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* 3. Verification Documents */}
                <section>
                    <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Official Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                            <label className="block text-xs font-black text-gray-500 mb-2">GOVERNMENT ID *</label>
                            <input
                                type="file" required accept=".pdf,image/*"
                                onChange={e => setGovtId(e.target.files[0])}
                                className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-white dark:bg-[#111827] file:text-emerald-700"
                            />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                            <label className="block text-xs font-black text-gray-500 mb-2">SHOP LICENSE *</label>
                            <input
                                type="file" required accept=".pdf,image/*"
                                onChange={e => setShopLicense(e.target.files[0])}
                                className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-white dark:bg-[#111827] file:text-emerald-700"
                            />
                        </div>
                    </div>
                </section>

                {/* 4. Bank Information */}
                <section>
                    <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Bank Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text" required placeholder="Bank Name"
                            value={form.bank_name}
                            onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
                            className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            type="text" required placeholder="IFSC Code"
                            value={form.bank_ifsc}
                            onChange={e => setForm(f => ({ ...f, bank_ifsc: e.target.value }))}
                            className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            type="text" required placeholder="Account Holder Name"
                            value={form.bank_account_name}
                            onChange={e => setForm(f => ({ ...f, bank_account_name: e.target.value }))}
                            className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            type="text" required placeholder="Account Number"
                            value={form.bank_account_number}
                            onChange={e => setForm(f => ({ ...f, bank_account_number: e.target.value }))}
                            className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </section>

                <button
                    type="submit" disabled={submitting}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"
                >
                    {submitting ? 'Processing Registration...' : 'Complete Registration & Submit'}
                </button>
            </form>
        </div>
    );
};

const ItemCard = ({ item, onDelete, onEdit }) => {
    const imgSrc = item.image_url
        ? (item.image_url.startsWith('http') ? item.image_url : `${BACKEND_URL}${item.image_url}`)
        : null;

    const isBlocked = item.is_active === false;

    return (
        <div className={`bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden group transition-all ${isBlocked ? 'ring-2 ring-red-100 bg-red-50/10' : ''}`}>
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {imgSrc ? (
                    <img src={imgSrc} alt={item.item_name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isBlocked ? 'grayscale opacity-50' : ''}`} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-700 dark:text-gray-300" />
                    </div>
                )}

                {/* Blocked Badge */}
                {isBlocked && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-200">
                        <AlertTriangle className="w-3 h-3" /> Blocked
                    </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="p-1.5 bg-white dark:bg-[#111827] rounded-lg shadow text-gray-600 hover:text-emerald-600">
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(item.item_id)} className="p-1.5 bg-white dark:bg-[#111827] rounded-lg shadow text-gray-600 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-bold leading-tight ${isBlocked ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>{item.item_name}</h3>
                    <div className="text-right shrink-0">
                        <p className={`text-sm font-black ${isBlocked ? 'text-gray-500 dark:text-gray-400' : 'text-emerald-600'}`}>₹{item.price_per_day}/day</p>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">Qty: {item.quantity_available || 1}</p>
                    </div>
                </div>

                {/* Admin Note for Blocked Items */}
                {isBlocked && item.admin_note && (
                    <div className="mt-3 p-2 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Feedback from Admin:</p>
                        <p className="text-[11px] text-red-800 font-medium italic">"{item.admin_note}"</p>
                        <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Update this item to request re-activation.
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between mt-3">
                    {item.category_name && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                            <Tag className="w-3 h-3" />{item.category_name}
                        </span>
                    )}
                    {item.delivery_available && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                            <Truck className="w-3 h-3" /> Delivery
                        </span>
                    )}
                </div>
                {item.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                )}
            </div>
        </div>
    );
};

const ItemFormModal = ({ categories, editItem, shopId, onClose, onSaved, shopDeliveryEnabled }) => {
    const isEdit = !!editItem;
    const fileRef = useRef(null);
    const [form, setForm] = useState({
        item_name: editItem?.item_name || '',
        description: editItem?.description || '',
        price_per_day: editItem?.price_per_day || '',
        category_id: editItem?.category_id || '',
        quantity: editItem?.quantity_available || 1,
        delivery_available: editItem ? !!editItem.delivery_available : !!shopDeliveryEnabled
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        editItem?.image_url
            ? (editItem.image_url.startsWith('http') ? editItem.image_url : `${BACKEND_URL}${editItem.image_url}`)
            : null
    );
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('item_name', form.item_name);
            fd.append('description', form.description);
            fd.append('price_per_day', form.price_per_day);
            fd.append('category_id', form.category_id);
            fd.append('quantity', form.quantity);
            fd.append('delivery_available', form.delivery_available);
            if (imageFile) fd.append('image', imageFile);

            if (isEdit) {
                await itemService.updateItem(editItem.item_id, fd);
                toast.success('Item updated!');
            } else {
                await itemService.addItem(fd);
                toast.success('Item added!');
            }
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to save item');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800/60 sticky top-0 bg-white dark:bg-[#111827] z-10">
                    <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">{isEdit ? 'Edit Item' : 'Add New Item'}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 dark:bg-gray-800/60 transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                {isEdit && editItem.is_active === false && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                            <AlertTriangle className="w-4 h-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Item Blocked</p>
                        </div>
                        <p className="text-[11px] text-red-800 font-medium italic mb-2">"{editItem.admin_note}"</p>
                        <p className="text-[10px] text-red-600 font-bold">Addressing these issues and saving will notify the admin for review.</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Item Image</label>
                        <div
                            className="border-2 border-dashed border-gray-200 dark:border-gray-700/60 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
                            onClick={() => fileRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                            ) : (
                                <div className="h-36 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                    <Upload className="w-8 h-8" />
                                    <span className="text-sm font-medium">Click to upload image</span>
                                    <span className="text-xs">PNG, JPG, WEBP up to 5MB</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>

                    {/* Item Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Item Name *</label>
                        <input
                            type="text" required
                            value={form.item_name}
                            onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))}
                            placeholder="e.g. Canon EOS DSLR"
                            className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                        <textarea
                            rows={3} value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Condition, features, accessories included..."
                            className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                    </div>

                    {/* Price & Quantity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Price Per Day (₹) *</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <input
                                    type="number" required min="1"
                                    value={form.price_per_day}
                                    onChange={e => setForm(f => ({ ...f, price_per_day: e.target.value }))}
                                    placeholder="e.g. 500"
                                    className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Total Quantity *</label>
                            <input
                                type="number" required min="1"
                                value={form.quantity}
                                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                                placeholder="e.g. 1"
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                        {categories.length === 0 ? (
                            <p className="text-xs text-red-500 font-medium">No permitted categories. Contact admin.</p>
                        ) : (
                            <select
                                required value={form.category_id}
                                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                className="w-full border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-[#111827]"
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Delivery Toggle (Only if shop allows it) */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${form.delivery_available ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Delivery Available</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">
                                    {form.delivery_available ? 'Delivery options active' : 'Pickup only for this item'}
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={form.delivery_available}
                                onChange={() => setForm(f => ({ ...f, delivery_available: !f.delivery_available }))}
                                disabled={!shopDeliveryEnabled && !form.delivery_available}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>
                    {!shopDeliveryEnabled && (
                        <p className="text-[10px] text-amber-600 font-bold px-2">
                             Shop-wide delivery is currently disabled. Enable it in dashboard to use this feature.
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/60 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:bg-gray-800/40 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={submitting || categories.length === 0}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm shadow-emerald-200"
                        >
                            {submitting ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Item')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ---------- Main Dashboard ----------

const ShopOwnerDashboard = () => {
    const { user } = useAuth();
    const [shop, setShop] = useState(undefined); // undefined = loading
    const [items, setItems] = useState([]);
    const [permittedCategories, setPermittedCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [loadingItems, setLoadingItems] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [submittingApproval, setSubmittingApproval] = useState(false);
    const [activeRentals, setActiveRentals] = useState([]);
    const [loadingRentals, setLoadingRentals] = useState(false);
    const [activeTab, setActiveTab] = useState('inventory');

    useEffect(() => {
        loadShop();
    }, []);

    const loadShop = async () => {
        try {
            const data = await shopService.getMyShop();
            setShop(data || null);
            if (data?.status === 'approved') {
                loadItems(data.shop_id);
                loadPermittedCategories();
                loadRentals();
            }
        } catch {
            setShop(null);
        }
    };

    const loadItems = async (shopId) => {
        setLoadingItems(true);
        try {
            const data = await itemService.getItemsByShop(shopId);
            setItems(Array.isArray(data) ? data : []);
        } catch {
            setItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    const loadPermittedCategories = async () => {
        try {
            const cats = await shopService.getPermittedCategories();
            setPermittedCategories(Array.isArray(cats) ? cats : []);
        } catch {
            setPermittedCategories([]);
        }
    };

    const loadRentals = async () => {
        setLoadingRentals(true);
        try {
            const res = await dashboardService.getActiveRentals();
            setActiveRentals(res.data || []);
        } catch {
            setActiveRentals([]);
        } finally {
            setLoadingRentals(false);
        }
    };

    const toggleDelivery = async () => {
        const newValue = !shop.delivery_enabled;
        if (newValue && !window.confirm('Enabling delivery will automatically turn on "Delivery Available" for ALL your items. Continue?')) return;

        try {
            // Using a simple object for updateMyShop as it handles JSON too
            await shopService.updateMyShop({ delivery_enabled: newValue });
            toast.success(`Delivery service ${newValue ? 'enabled' : 'disabled'}!`);
            loadShop();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update delivery setting');
        }
    };

    const handleConfirmReturn = async (bookingId) => {
        if (!window.confirm('Are you sure you want to confirm the return of this item?')) return;
        try {
            await bookingService.returnBooking(bookingId);
            toast.success('Return confirmed successfully!');
            loadRentals();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to confirm return');
        }
    };

    const handleItemSaved = () => {
        setShowForm(false);
        setEditItem(null);
        if (shop?.shop_id) loadItems(shop.shop_id);
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await itemService.deleteItem(itemId);
            toast.success('Item deleted');
            setItems(its => its.filter(i => i.item_id !== itemId));
        } catch {
            toast.error('Failed to delete item');
        }
    };

    const handleSubmitForApproval = async () => {
        setSubmittingApproval(true);
        try {
            await shopService.submitForApproval();
            toast.success('Submitted for approval!');
            loadShop();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmittingApproval(false);
        }
    };

    // Loading state
    if (shop === undefined) return (
        <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Shop Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.fullname?.split(' ')[0]}!</p>
                </div>
                {shop?.status === 'approved' && (
                    <button
                        onClick={() => { setEditItem(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                )}
            </div>

            {/* No Shop → Unified Registration Form */}
            {shop === null && <UnifiedShopRegisterForm onRegistered={(s) => setShop(s)} />}

            {/* Status Banner for incomplete/pending/rejected */}
            {shop && shop.status !== 'approved' && (
                <div className="space-y-4">
                    <StatusBanner
                        status={shop.status}
                        hasDetails={
                            !!shop.govt_id_url &&
                            !!shop.shop_license_url &&
                            !!shop.bank_account_name &&
                            !!shop.bank_account_number &&
                            !!shop.bank_ifsc &&
                            !!shop.bank_name &&
                            !!shop.address &&
                            !!shop.city &&
                            !!shop.state &&
                            !!shop.pincode
                        }
                        onCompleteDetails={() => setShowVerification(true)}
                        onRequestApproval={handleSubmitForApproval}
                        submittingApproval={submittingApproval}
                    />

                    {shop.status === 'incomplete' && (
                        <VerificationOverview
                            shop={shop}
                            onCompleteDetails={() => setShowVerification(true)}
                        />
                    )}
                </div>
            )}

            {/* Verification Form (Modal-like view when active) */}
            {showVerification && shop && (
                <VerificationForm
                    shop={shop}
                    onSaved={() => { setShowVerification(false); loadShop(); }}
                    onCancel={() => setShowVerification(false)}
                />
            )}

            {/* Shop Info Card */}
            {shop && (
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-700">
                            {shop.shop_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">{shop.shop_name}</h2>
                            {shop.location && <p className="text-sm text-gray-500">{typeof shop.location === 'object' ? shop.location.city : shop.location}</p>}
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-black capitalize ${shop.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            shop.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {shop.status === 'approved' && <CheckCircle className="inline w-3 h-3 mr-1" />}
                            {shop.status}
                        </span>
                        {shop.status === 'incomplete' && (
                            <button
                                onClick={handleSubmitForApproval}
                                disabled={submittingApproval}
                                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100"
                            >
                                {submittingApproval ? 'Submitting...' : 'Request Admin Approval'}
                            </button>
                        )}
                    </div>
                    {shop.status === 'approved' && (
                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${shop.delivery_enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Delivery Service</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{shop.delivery_enabled ? 'Global delivery is active for your shop' : 'Delivery service is currently disabled'}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleDelivery}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${shop.delivery_enabled ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shop.delivery_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    )}

                    {shop.status === 'approved' && permittedCategories.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">PERMITTED CATEGORIES</p>
                            <div className="flex flex-wrap gap-2">
                                {permittedCategories.map(c => (
                                    <span key={c.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                        {c.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Items Inventory and Active Rentals (only for approved shops) */}
            {shop?.status === 'approved' && (
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 dark:border-gray-800/60 flex items-center bg-gray-50/50 dark:bg-gray-800/20">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`flex-1 py-4 text-sm font-black border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-emerald-500 text-emerald-600 bg-white dark:bg-[#111827]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white dark:hover:bg-[#111827]'}`}
                        >
                            Your Items ({items.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('rentals')}
                            className={`flex-1 py-4 text-sm font-black border-b-2 transition-colors ${activeTab === 'rentals' ? 'border-emerald-500 text-emerald-600 bg-white dark:bg-[#111827]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white dark:hover:bg-[#111827]'}`}
                        >
                            Active Bookings ({activeRentals.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('deliveries')}
                            className={`flex-1 py-4 text-sm font-black border-b-2 transition-colors ${activeTab === 'deliveries' ? 'border-emerald-500 text-emerald-600 bg-white dark:bg-[#111827]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white dark:hover:bg-[#111827]'}`}
                        >
                            🚚 Deliveries
                        </button>
                    </div>

                    {activeTab === 'inventory' && (
                        <div>
                            {loadingItems ? (
                                <div className="p-12 text-center">
                                    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="w-8 h-8 text-gray-800 dark:text-gray-200" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No items yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Get started by adding your first rental item</p>
                                    <button
                                        onClick={() => { setEditItem(null); setShowForm(true); }}
                                        className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline"
                                    >
                                        <Plus className="w-4 h-4" /> Add your first item
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                    {items.map(item => (
                                        <ItemCard
                                            key={item.item_id}
                                            item={item}
                                            onDelete={handleDelete}
                                            onEdit={(it) => { setEditItem(it); setShowForm(true); }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'rentals' && (
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/20">
                            {loadingRentals ? (
                                <div className="p-12 text-center">
                                    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            ) : activeRentals.length === 0 ? (
                                <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8 text-gray-800 dark:text-gray-200" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No active bookings</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your items are currently waiting to be rented.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {activeRentals.map(rental => (
                                        <RentalStatusCard 
                                            key={rental.rentalId} 
                                            rental={rental} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'deliveries' && (
                        <div className="p-6">
                            <DeliveryManagement />
                        </div>
                    )}
                </div>
            )}


            {/* Add / Edit Item Modal */}
            {showForm && (
                <ItemFormModal
                    categories={permittedCategories}
                    editItem={editItem}
                    shopId={shop?.shop_id}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                    onSaved={handleItemSaved}
                    shopDeliveryEnabled={shop?.delivery_enabled}
                />
            )}
        </div>
    );
};

export default ShopOwnerDashboard;
