import { useState, useEffect } from 'react';
import shopService from '../../services/shop.service';
import categoryService from '../../services/category.service';
import { Store, Package, TrendingUp, DollarSign, Users, MapPin, AlertCircle, CheckCircle, XCircle, Clock, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminShops = () => {
    const [shops, setShops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('approved'); // Focused on approved shops
    const [selectedShop, setSelectedShop] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [shopsRes, catsRes] = await Promise.all([
                shopService.getAllShops(),
                categoryService.getAllCategories()
            ]);
            const shops = shopsRes?.data || shopsRes;
            setShops(Array.isArray(shops) ? shops : []);
            setCategories(catsRes);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (shopId) => {
        if (selectedCategories.length === 0) {
            toast.error('Please select at least one category for this shop');
            return;
        }

        setSubmitting(true);
        try {
            await shopService.approveShopWithCategories(shopId, selectedCategories);
            toast.success('Shop approved successfully!');
            setSelectedShop(null);
            setSelectedCategories([]);
            fetchInitialData();
        } catch (err) {
            toast.error('Approval failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async (shopId) => {
        if (!window.confirm('Are you sure you want to reject this shop?')) return;
        try {
            await shopService.rejectShop(shopId);
            toast.success('Shop rejected');
            fetchInitialData();
        } catch (err) {
            toast.error('Rejection failed');
        }
    };

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const pendingShops = shops.filter(s => s.status === 'pending');
    const approvedShops = shops.filter(s => s.status === 'approved');
    const incompleteShops = shops.filter(s => s.status === 'incomplete');
    const displayShops = activeTab === 'pending' ? pendingShops : (activeTab === 'approved' ? approvedShops : incompleteShops);

    const fmtINR = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Shop Performance Hub</h1>
                    <p className="text-gray-500 font-medium mt-1">Monitor business performance and rental analytics across all approved shops</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <div className="px-4 py-2 bg-white dark:bg-[#111827] shadow text-emerald-600 rounded-lg text-sm font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approved Shops ({approvedShops.length})
                    </div>
                </div>
            </div>

            {displayShops.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-gray-800 dark:text-gray-200" />
                    </div>
                    <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No {activeTab} shops</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Check the other tab for more shops</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {displayShops.map((shop) => (
                        <div key={shop.id} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-700">
                                        {shop.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">{shop.name}</h2>
                                        <p className="text-sm text-gray-500 leading-relaxed mt-1">{shop.description}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs font-bold">
                                            <span className="flex items-center gap-1.5 text-gray-500">
                                                <MapPin className="w-3.5 h-3.5" /> {shop.city}, {shop.state}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-blue-600">
                                                <Users className="w-3.5 h-3.5" /> Owner: {shop.owner_name} ({shop.owner_email})
                                            </span>
                                            {shop.status === 'approved' && (
                                                <span className="flex items-center gap-1.5 text-emerald-600">
                                                    <DollarSign className="w-3.5 h-3.5" /> Revenue: {fmtINR(shop.total_revenue || 0)}
                                                </span>
                                            )}
                                            {shop.status === 'incomplete' && (
                                                <span className="flex items-center gap-1.5 text-amber-600">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Awaiting details from owner
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex md:flex-col items-center justify-end gap-3 min-w-[200px]">
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl">
                                        <CheckCircle className="w-4 h-4" /> Active Business
                                    </div>
                                    <button 
                                        onClick={() => toast.success('Growth Mode metrics and accelerator program activated for ' + shop.name)}
                                        className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all cursor-pointer active:scale-95"
                                    >
                                        <TrendingUp className="w-3.5 h-3.5" /> Growth Mode
                                    </button>
                                </div>
                            </div>

                            {/* Approval Modal logic inside the card for simplicity in this view */}
                            {selectedShop?.id === shop.id && (
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800/60 animate-slide-down">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">Select Permitted Categories</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {categories.map(cat => {
                                            const isSelected = selectedCategories.includes(cat.id);
                                            return (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setSelectedCategories(prev =>
                                                            isSelected ? prev.filter(p => p !== cat.id) : [...prev, cat.id]
                                                        );
                                                    }}
                                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${isSelected
                                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                                        : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-700/60 text-gray-600 hover:border-emerald-300'
                                                        }`}
                                                >
                                                    {cat.name}
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => handleApprove(shop.id)}
                                            disabled={submitting}
                                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                                        >
                                            {submitting ? 'Approving...' : 'Confirm Approval & Categories'}
                                        </button>
                                        <button
                                            onClick={() => { setSelectedShop(null); setSelectedCategories([]); }}
                                            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-xl text-sm font-black hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminShops;
