import { useState, useEffect } from 'react';
import itemService from '../../services/item.service';
import categoryService from '../../services/category.service';
import { Package, Search, Filter, AlertTriangle, Eye, EyeOff, Trash2, Store, Tag, X, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ModerationModal = ({ item, onConfirm, onClose }) => {
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note.trim()) {
            toast.error('Please provide a reason for blocking this item');
            return;
        }
        setSubmitting(true);
        try {
            await onConfirm(note);
            onClose();
        } catch (err) {
            toast.error('Failed to block item');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800/60 flex justify-between items-center bg-red-50/50">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="font-black text-lg">Block Item</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:bg-[#111827] rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Item: <span className="text-gray-900 dark:text-gray-100">{item.item_name}</span></p>
                        <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Reason for Blocking *</label>
                        <textarea
                            required
                            autoFocus
                            rows={4}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="e.g. Incorrect category selection. This item belongs in 'Vehicles', not 'Electronics'."
                            className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-black text-gray-500 hover:bg-gray-50 dark:bg-gray-800/40 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 bg-red-600 text-white text-sm font-black rounded-2xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                            {submitting ? 'Blocking...' : <><Send className="w-4 h-4" /> Send & Block</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminItems = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Moderation state
    const [modItem, setModItem] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsData, catsData] = await Promise.all([
                itemService.getAllItemsAdmin(),
                categoryService.getAllCategories()
            ]);
            setItems(itemsData);
            setCategories(catsData);
        } catch (err) {
            toast.error('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (itemId, currentStatus, adminNote = null) => {
        try {
            await itemService.toggleItemStatus(itemId, !currentStatus, adminNote);
            toast.success(`Item ${!currentStatus ? 'activated' : 'deactivated'}`);
            setItems(prev => prev.map(item =>
                item.item_id === itemId ? { ...item, item_is_active: !currentStatus, admin_note: adminNote } : item
            ));
        } catch (err) {
            toast.error('Failed to update status');
            throw err;
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.shop_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category_id?.toString() === selectedCategory;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && item.item_is_active) ||
            (statusFilter === 'inactive' && !item.item_is_active) ||
            (statusFilter === 'needs_review' && item.needs_review);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6 space-y-8 animate-fade-in text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight">Item Control Hub</h1>
                <p className="text-gray-500 font-medium mt-1">Moderate listings, verify categories, and manage global inventory</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm space-y-4 text-gray-900 dark:text-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by item or shop name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-300"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700 dark:text-gray-300"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="needs_review">Needs Review</option>
                            <option value="inactive">Inactive/Blocked</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Scrutiny Alert (for mis-categorized items) */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-800">
                    <span className="uppercase mr-2 font-black">Moderation Tip:</span>
                    Filter by a specific category (e.g., "Electronics") to quickly spot items that don't belong (e.g., a "Bike" in Electronics).
                </p>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/40/50">
                                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Details</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shop</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price / Qty</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visibility</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredItems.map(item => (
                                <tr key={item.item_id} className={`hover:bg-gray-50 dark:bg-gray-800/40/50 transition-colors group ${!item.item_is_active ? 'bg-red-50/20' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-800/60 shadow-sm flex-shrink-0">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url.startsWith('http') ? item.image_url : `${BACKEND_URL}${item.image_url}`}
                                                        alt="" className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-6 h-6 text-gray-700 dark:text-gray-300 m-3" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-gray-900 dark:text-gray-100 truncate">{item.item_name}</div>
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight truncate max-w-[200px]">
                                                    ID: #{item.item_id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                            <Tag className="w-3 h-3" /> {item.category_name || item.shop_item_category_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <Store className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            {item.shop_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-black text-emerald-600">₹{item.price_per_day}/day</div>
                                        <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Qty: {item.quantity_available}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${item.item_is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.item_is_active ? 'bg-emerald-600' : 'bg-red-600 animate-pulse'}`} />
                                                {item.item_is_active ? 'Public' : 'Blocked'}
                                            </span>
                                            {item.needs_review && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider w-fit border border-amber-100 animate-bounce">
                                                    Updated for Review
                                                </span>
                                            )}
                                            {!item.item_is_active && item.admin_note && (
                                                <p className="text-[10px] text-red-400 font-medium italic max-w-[150px] truncate" title={item.admin_note}>
                                                    "{item.admin_note}"
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                if (item.item_is_active) {
                                                    setModItem(item);
                                                } else {
                                                    handleToggleStatus(item.item_id, item.item_is_active);
                                                }
                                            }}
                                            className={`p-2 rounded-xl transition-all ${item.item_is_active
                                                ? 'text-red-500 hover:bg-red-50'
                                                : 'text-emerald-500 hover:bg-emerald-50'}`}
                                            title={item.item_is_active ? 'Block & Notify Owner' : 'Re-activate Listing'}
                                        >
                                            {item.item_is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredItems.length === 0 && (
                    <div className="p-20 text-center">
                        <Package className="w-12 h-12 text-gray-800 dark:text-gray-200 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm">No items found matching your filters.</h3>
                    </div>
                )}
            </div>

            {/* Moderation Modal */}
            {modItem && (
                <ModerationModal
                    item={modItem}
                    onClose={() => setModItem(null)}
                    onConfirm={(note) => handleToggleStatus(modItem.item_id, true, note)}
                />
            )}
        </div>
    );
};

export default AdminItems;
