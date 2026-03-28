import { useEffect, useState } from 'react';
import shopService from '../../services/shop.service';
import categoryService from '../../services/category.service';
import { toast } from 'react-toastify';
import { Store, User, Mail, MapPin, CheckCircle, XCircle, Clock, Tag, ExternalLink, CreditCard, FileText } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_TABS = ['pending', 'incomplete', 'approved', 'rejected'];

const statusConfig = {
    pending: { color: 'amber', icon: Clock, label: 'Pending' },
    incomplete: { color: 'gray', icon: FileText, label: 'Incomplete' },
    approved: { color: 'emerald', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'red', icon: XCircle, label: 'Rejected' },
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
            setAllCategories(data);
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
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Approval Hub</h1>
                <p className="text-gray-500 font-medium mt-1">Review registrations and verify documents for new shop owners</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 w-fit">
                {STATUS_TABS.map(t => {
                    const cfg = statusConfig[t];
                    const Icon = cfg.icon;
                    const active = tab === t;
                    return (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${active
                                ? `bg-white dark:bg-[#111827] shadow-sm text-${cfg.color}-700`
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'
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
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-gray-800 dark:text-gray-200" />
                    </div>
                    <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No {tab} shops</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {tab === 'pending' ? 'No shops are awaiting approval.' : `No ${tab} shops found.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {shops.map(shop => {
                        const shopCats = selectedCats[shop.shop_id] || new Set();
                        const proc = processing[shop.shop_id];
                        return (
                            <div key={shop.shop_id} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden">
                                {/* Shop Header */}
                                <div className="p-6 border-b border-gray-50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-700 flex-shrink-0">
                                                {shop.shop_name?.charAt(0)?.toUpperCase() || 'S'}
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">{shop.shop_name}</h2>
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
                                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/40/50">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                                        <span className="font-medium truncate">{shop.owner_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                                        <span className="truncate">{shop.owner_email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 col-span-1 md:col-span-2">
                                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                                        <span className="text-xs">
                                            {shop.address}, {shop.city}, {shop.state} - {shop.pincode}
                                        </span>
                                    </div>
                                </div>

                                {/* Verification Details Section */}
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-gray-50">
                                    {/* Documents */}
                                    <div>
                                        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5" /> Verification Documents
                                        </h3>
                                        <div className="space-y-2">
                                            {shop.govt_id_url ? (
                                                <a
                                                    href={shop.govt_id_url.startsWith('http') ? shop.govt_id_url : `${BACKEND_URL}${shop.govt_id_url}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors group"
                                                >
                                                    <span className="text-xs font-bold text-blue-700">Government ID</span>
                                                    <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600" />
                                                </a>
                                            ) : (
                                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">Missing Govt ID</div>
                                            )}
                                            {shop.shop_license_url ? (
                                                <a
                                                    href={shop.shop_license_url.startsWith('http') ? shop.shop_license_url : `${BACKEND_URL}${shop.shop_license_url}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors group"
                                                >
                                                    <span className="text-xs font-bold text-blue-700">Shop License</span>
                                                    <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600" />
                                                </a>
                                            ) : (
                                                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400">Missing Shop License</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bank Details */}
                                    <div>
                                        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <CreditCard className="w-3.5 h-3.5" /> Bank Information
                                        </h3>
                                        {shop.bank_account_number ? (
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600">
                                                    <span>ACCOUNT HOLDER</span>
                                                    <span>IFSC CODE</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-sm font-black text-emerald-900 uppercase tracking-tight">{shop.bank_account_name}</span>
                                                    <span className="text-xs font-black text-emerald-700 font-mono tracking-widest">{shop.bank_ifsc}</span>
                                                </div>
                                                <div className="pt-2 border-t border-emerald-100/50">
                                                    <p className="text-[10px] font-bold text-emerald-600 mb-0.5">ACCOUNT NUMBER</p>
                                                    <p className="text-lg font-black text-emerald-900 tracking-[0.2em]">{shop.bank_account_number}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">{shop.bank_name}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-center justify-center text-center">
                                                <p className="text-xs font-bold text-amber-700">Bank details not provided</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Category Selector (only for pending or incomplete shops) */}
                                {(tab === 'pending' || tab === 'incomplete') && allCategories.length > 0 && (
                                    <div className="px-6 py-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Tag className="w-4 h-4 text-emerald-600" />
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Permitted Categories</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">(select at least one)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {allCategories.map(cat => {
                                                const checked = shopCats.has(cat.id);
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => toggleCategory(shop.shop_id, cat.id)}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${checked
                                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200'
                                                            : 'border-gray-200 dark:border-gray-700/60 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
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

                                {/* Action Buttons (only for pending or incomplete) */}
                                {(tab === 'pending' || tab === 'incomplete') && (
                                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800/60 flex justify-end gap-3">
                                        <button
                                            onClick={() => handleReject(shop.shop_id)}
                                            disabled={!!proc}
                                            className="px-5 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                                        >
                                            {proc === 'rejecting' ? 'Rejecting…' : '✗ Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(shop.shop_id)}
                                            disabled={!!proc}
                                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${shopCats.size === 0
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                                }`}
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
