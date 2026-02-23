import { useEffect, useState } from 'react';
import shopService from '../../services/shop.service';
import categoryService from '../../services/category.service';
import { toast } from 'react-toastify';
import { Store, User, Mail, MapPin, CheckCircle, XCircle, Clock, Tag } from 'lucide-react';

const STATUS_TABS = ['pending', 'approved', 'rejected'];

const statusConfig = {
    pending:  { color: 'amber',   icon: Clock,        label: 'Pending' },
    approved: { color: 'emerald', icon: CheckCircle,  label: 'Approved' },
    rejected: { color: 'red',     icon: XCircle,      label: 'Rejected' },
};

const ShopApprovals = () => {
    const [tab, setTab] = useState('pending');
    const [shops, setShops] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    // Per-shop selected categories  { [shopId]: Set<categoryId> }
    const [selectedCats, setSelectedCats] = useState({});
    const [processing, setProcessing] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchShops();
    }, [tab]);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            setAllCategories(Array.isArray(data) ? data : []);
        } catch {
            // silent — categories are optional UI enhancement
        }
    };

    const fetchShops = async () => {
        setLoading(true);
        try {
            const data = await shopService.getAllShops(tab);
            setShops(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to fetch shops');
            setShops([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (shopId, catId) => {
        setSelectedCats(prev => {
            const current = new Set(prev[shopId] || []);
            if (current.has(catId)) current.delete(catId);
            else current.add(catId);
            return { ...prev, [shopId]: current };
        });
    };

    const handleApprove = async (shopId) => {
        const categoryIds = Array.from(selectedCats[shopId] || []);
        if (categoryIds.length === 0) {
            toast.warn('Please select at least one permitted category before approving');
            return;
        }
        setProcessing(p => ({ ...p, [shopId]: 'approving' }));
        try {
            await shopService.approveShopWithCategories(shopId, categoryIds);
            toast.success('Shop approved successfully!');
            setShops(s => s.filter(sh => sh.shop_id !== shopId));
        } catch {
            toast.error('Failed to approve shop');
        } finally {
            setProcessing(p => ({ ...p, [shopId]: null }));
        }
    };

    const handleReject = async (shopId) => {
        if (!window.confirm('Are you sure you want to reject this shop?')) return;
        setProcessing(p => ({ ...p, [shopId]: 'rejecting' }));
        try {
            await shopService.rejectShop(shopId);
            toast.success('Shop rejected');
            setShops(s => s.filter(sh => sh.shop_id !== shopId));
        } catch {
            toast.error('Failed to reject shop');
        } finally {
            setProcessing(p => ({ ...p, [shopId]: null }));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shop Approvals</h1>
                <p className="text-gray-500 font-medium mt-1">
                    Review shop registrations, assign permitted categories, and approve or reject.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
                {STATUS_TABS.map(t => {
                    const cfg = statusConfig[t];
                    const Icon = cfg.icon;
                    const active = tab === t;
                    return (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                                active
                                    ? `bg-white shadow-sm text-${cfg.color}-700`
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {cfg.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : shops.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-gray-200" />
                    </div>
                    <h3 className="text-base font-bold text-gray-700">No {tab} shops</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        {tab === 'pending' ? 'No shops are awaiting approval.' : `No ${tab} shops found.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {shops.map(shop => {
                        const shopCats = selectedCats[shop.shop_id] || new Set();
                        const proc = processing[shop.shop_id];
                        return (
                            <div key={shop.shop_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Shop Header */}
                                <div className="p-6 border-b border-gray-50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-700 flex-shrink-0">
                                                {shop.shop_name?.charAt(0)?.toUpperCase() || 'S'}
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-gray-900">{shop.shop_name}</h2>
                                                {shop.description && (
                                                    <p className="text-sm text-gray-500 mt-0.5 max-w-lg">{shop.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-black bg-${statusConfig[shop.status]?.color || 'gray'}-100 text-${statusConfig[shop.status]?.color || 'gray'}-700 capitalize shrink-0`}>
                                            {shop.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Info Row */}
                                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-medium">{shop.owner_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span>{shop.owner_email || 'N/A'}</span>
                                    </div>
                                    {shop.location && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span>
                                                {typeof shop.location === 'object'
                                                    ? `${shop.location.city || ''}${shop.location.state ? ', ' + shop.location.state : ''}`
                                                    : shop.location}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Category Selector (only for pending shops) */}
                                {tab === 'pending' && allCategories.length > 0 && (
                                    <div className="px-6 py-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Tag className="w-4 h-4 text-emerald-600" />
                                            <span className="text-sm font-bold text-gray-700">Permitted Categories</span>
                                            <span className="text-xs text-gray-400">(select at least one)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {allCategories.map(cat => {
                                                const checked = shopCats.has(cat.id);
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => toggleCategory(shop.shop_id, cat.id)}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                                            checked
                                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200'
                                                                : 'border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
                                                        }`}
                                                    >
                                                        {checked && '✓ '}{cat.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {shopCats.size === 0 && (
                                            <p className="text-xs text-amber-600 mt-2 font-medium">
                                                ⚠ Select categories before approving
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons (only for pending) */}
                                {tab === 'pending' && (
                                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                                        <button
                                            onClick={() => handleReject(shop.shop_id)}
                                            disabled={!!proc}
                                            className="px-5 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                                        >
                                            {proc === 'rejecting' ? 'Rejecting…' : '✗ Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(shop.shop_id)}
                                            disabled={!!proc || shopCats.size === 0}
                                            className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm shadow-emerald-200"
                                        >
                                            {proc === 'approving' ? 'Approving…' : '✓ Approve'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ShopApprovals;
