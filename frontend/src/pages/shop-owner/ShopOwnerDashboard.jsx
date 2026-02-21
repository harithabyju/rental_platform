import { useState, useEffect } from 'react';
import CategoryDropdown from '../../components/common/CategoryDropdown';
import { Store, Package, Plus, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ShopOwnerDashboard = () => {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        pricePerDay: '',
        categoryId: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItemData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Placeholder: In a real implementation, call itemService.createItem(itemData)
            await new Promise(r => setTimeout(r, 800));
            toast.success(`Item "${itemData.name}" created successfully!`);
            setItemData({ name: '', description: '', pricePerDay: '', categoryId: '' });
            setShowForm(false);
        } catch (err) {
            toast.error('Failed to create item. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Shop Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.fullname?.split(' ')[0]}!</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                >
                    <Plus className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            {/* Info Banner (placeholder until shop is registered) */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-bold text-amber-800 text-sm">Shop Registration Required</p>
                    <p className="text-amber-700 text-sm mt-1">
                        You need to register your shop before adding items. Shop registration and approval is handled by the admin.
                        Once approved, you can start listing your rental items here.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Items', value: '0', icon: Package, color: 'emerald' },
                    { label: 'Active Rentals', value: '0', icon: Store, color: 'blue' },
                    { label: 'Total Revenue', value: '₹0', icon: Store, color: 'purple' },
                    { label: 'Avg. Rating', value: '—', icon: Store, color: 'amber' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Items List Placeholder */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Your Items</h2>
                </div>
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-200" />
                    </div>
                    <h3 className="text-base font-bold text-gray-700">No items yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Get started by adding your first rental item</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline"
                    >
                        <Plus className="w-4 h-4" /> Add your first item
                    </button>
                </div>
            </div>

            {/* Add Item Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-black text-gray-900">Add New Item</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Item Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={itemData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Canon DSLR Camera"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={itemData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Describe the item condition, features..."
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Price Per Day (₹)</label>
                                <input
                                    type="number"
                                    name="pricePerDay"
                                    value={itemData.pricePerDay}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    placeholder="e.g. 500"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            {/* Uses the self-fetching common CategoryDropdown */}
                            <CategoryDropdown
                                name="categoryId"
                                value={itemData.categoryId}
                                onChange={handleChange}
                                label="Category"
                                required
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all"
                                >
                                    {submitting ? 'Creating...' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopOwnerDashboard;
