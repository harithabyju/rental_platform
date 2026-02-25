import { useState, useEffect, useRef } from 'react';
import { Store, Package, Plus, X, AlertCircle, Clock, XCircle, Edit2, Trash2, Upload, Image as ImageIcon, DollarSign, Tag, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import shopService from '../../services/shop.service';
import itemService from '../../services/item.service';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ---------- Sub-components ----------

const StatusBanner = ({ status }) => {
    if (status === 'pending') return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
                <p className="font-bold text-amber-800 text-sm">Awaiting Admin Approval</p>
                <p className="text-amber-700 text-sm mt-1">Your shop registration is under review. You'll be able to add items once approved.</p>
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

const ShopRegisterForm = ({ onRegistered }) => {
    const [form, setForm] = useState({
        shop_name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        latitude: '',
        longitude: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Re-structure to match backend service expectations
            const payload = {
                name: form.shop_name,
                description: form.description,
                location: {
                    address: form.address,
                    city: form.city,
                    state: form.state,
                    zip: form.pincode,
                    phone: form.phone,
                    email: form.email,
                    latitude: parseFloat(form.latitude) || 0,
                    longitude: parseFloat(form.longitude) || 0
                }
            };
            const shop = await shopService.registerShop(payload);
            toast.success('Shop registered! Awaiting admin approval.');
            onRegistered(shop);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-900">Register Your Shop</h2>
                    <p className="text-sm text-gray-500">Fill in your business details to get started</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Shop Name *</label>
                        <input
                            type="text" required
                            value={form.shop_name}
                            onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))}
                            placeholder="e.g. Kochi Camera Rentals"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone *</label>
                        <input
                            type="text" required
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="e.g. +91 9876543210"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                    <textarea
                        rows={2} value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Tell customers about your shop..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Address *</label>
                    <input
                        type="text" required
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        placeholder="Street address, locality..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">City *</label>
                        <input
                            type="text" required
                            value={form.city}
                            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                            placeholder="e.g. Kochi"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">State *</label>
                        <input
                            type="text" required
                            value={form.state}
                            onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                            placeholder="e.g. Kerala"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Pincode *</label>
                        <input
                            type="text" required
                            value={form.pincode}
                            onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                            placeholder="682001"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Latitude *</label>
                        <input
                            type="number" step="any" required
                            value={form.latitude}
                            onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                            placeholder="e.g. 9.9312"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Longitude *</label>
                        <input
                            type="number" step="any" required
                            value={form.longitude}
                            onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                            placeholder="e.g. 76.2673"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
                <button
                    type="submit" disabled={submitting}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100"
                >
                    {submitting ? 'Submitting…' : 'Submit Registration'}
                </button>
            </form>
        </div>
    );
};

const ItemCard = ({ item, onDelete, onEdit }) => {
    const imgSrc = item.image_url
        ? (item.image_url.startsWith('http') ? item.image_url : `${BACKEND_URL}${item.image_url}`)
        : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {imgSrc ? (
                    <img src={imgSrc} alt={item.item_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-emerald-600">
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(item.item_id)} className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.item_name}</h3>
                    <div className="text-right shrink-0">
                        <p className="text-sm font-black text-emerald-600">₹{item.price_per_day}/day</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">Qty: {item.quantity_available || 1}</p>
                    </div>
                </div>
                {item.category_name && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                        <Tag className="w-3 h-3" />{item.category_name}
                    </span>
                )}
                {item.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                )}
            </div>
        </div>
    );
};

const ItemFormModal = ({ categories, editItem, shopId, onClose, onSaved }) => {
    const isEdit = !!editItem;
    const fileRef = useRef(null);
    const [form, setForm] = useState({
        item_name: editItem?.item_name || '',
        description: editItem?.description || '',
        price_per_day: editItem?.price_per_day || '',
        category_id: editItem?.category_id || '',
        quantity: editItem?.quantity_available || 1,
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-black text-gray-900">{isEdit ? 'Edit Item' : 'Add New Item'}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Item Image</label>
                        <div
                            className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
                            onClick={() => fileRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                            ) : (
                                <div className="h-36 flex flex-col items-center justify-center gap-2 text-gray-400">
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
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Item Name *</label>
                        <input
                            type="text" required
                            value={form.item_name}
                            onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))}
                            placeholder="e.g. Canon EOS DSLR"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                        <textarea
                            rows={3} value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Condition, features, accessories included..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                    </div>

                    {/* Price & Quantity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Price Per Day (₹) *</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number" required min="1"
                                    value={form.price_per_day}
                                    onChange={e => setForm(f => ({ ...f, price_per_day: e.target.value }))}
                                    placeholder="e.g. 500"
                                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Total Quantity *</label>
                            <input
                                type="number" required min="1"
                                value={form.quantity}
                                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                                placeholder="e.g. 1"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Category *</label>
                        {categories.length === 0 ? (
                            <p className="text-xs text-red-500 font-medium">No permitted categories. Contact admin.</p>
                        ) : (
                            <select
                                required value={form.category_id}
                                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
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
                    <h1 className="text-2xl font-black text-gray-900">Shop Dashboard</h1>
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

            {/* No Shop → Registration Form */}
            {shop === null && <ShopRegisterForm onRegistered={(s) => setShop(s)} />}

            {/* Status Banner for pending/rejected */}
            {shop && shop.status !== 'approved' && <StatusBanner status={shop.status} />}

            {/* Shop Info Card */}
            {shop && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-700">
                            {shop.shop_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-black text-gray-900">{shop.shop_name}</h2>
                            {shop.location && <p className="text-sm text-gray-500">{typeof shop.location === 'object' ? shop.location.city : shop.location}</p>}
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-black capitalize ${shop.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            shop.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {shop.status === 'approved' && <CheckCircle className="inline w-3 h-3 mr-1" />}
                            {shop.status}
                        </span>
                    </div>
                    {shop.status === 'approved' && permittedCategories.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <p className="text-xs font-bold text-gray-400 mb-2">PERMITTED CATEGORIES</p>
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

            {/* Items Inventory (only for approved shops) */}
            {shop?.status === 'approved' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Your Items</h2>
                        <span className="text-sm font-bold text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                    </div>

                    {loadingItems ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-200" />
                            </div>
                            <h3 className="text-base font-bold text-gray-700">No items yet</h3>
                            <p className="text-gray-400 text-sm mt-1">Get started by adding your first rental item</p>
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

            {/* Add / Edit Item Modal */}
            {showForm && (
                <ItemFormModal
                    categories={permittedCategories}
                    editItem={editItem}
                    shopId={shop?.shop_id}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                    onSaved={handleItemSaved}
                />
            )}
        </div>
    );
};

export default ShopOwnerDashboard;
