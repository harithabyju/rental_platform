import { useEffect, useState } from 'react';
import shopService from '../../services/shop.service';
import itemService from '../../services/item.service';
import * as dashboardService from '../../services/dashboardService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddItemModal = ({ onClose, onAdded, shopId }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        item_name: '',
        description: '',
        price_per_day: '',
        category_id: '',
        image_url: '',
        quantity: 1
    });

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const data = await dashboardService.getCategories();
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: data[0].id }));
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCats();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('item_name', formData.item_name);
            data.append('description', formData.description);
            data.append('price_per_day', formData.price_per_day);
            data.append('category_id', formData.category_id);
            data.append('shop_id', shopId);
            data.append('quantity', formData.quantity);

            if (formData.image_file) {
                data.append('image', formData.image_file);
            } else if (formData.image_url) {
                data.append('image_url', formData.image_url);
            }

            await itemService.addItem(data);
            toast.success('Item added successfully');
            onAdded();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add item');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#111827] rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Item Name"
                        className="w-full border p-2 rounded"
                        value={formData.item_name}
                        onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        className="w-full border p-2 rounded"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Price per day (INR)"
                        className="w-full border p-2 rounded"
                        value={formData.price_per_day}
                        onChange={e => setFormData({ ...formData, price_per_day: e.target.value })}
                        required
                    />
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Image File (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full border p-2 rounded text-sm"
                                onChange={e => setFormData({ ...formData, image_file: e.target.files[0] })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Or Image URL</label>
                            <input
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                className="w-full border p-2 rounded text-sm"
                                value={formData.image_url}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Total Quantity</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="3"
                                className="w-full border p-2 rounded text-sm"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Category</label>
                        <select
                            className="w-full border p-2 rounded text-sm"
                            value={formData.category_id}
                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-50 dark:bg-gray-800/60 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-green-600">Add Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditItemModal = ({ item, onClose, onUpdated }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        item_name: item.item_name || '',
        description: item.description || '',
        price_per_day: item.price_per_day || '',
        category_id: item.shop_item_category_id || item.category_id || '',
        quantity: item.quantity_available || 1,
        status: item.is_available ? 'available' : 'unavailable'
    });

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const data = await dashboardService.getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCats();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('item_name', formData.item_name);
            data.append('description', formData.description);
            data.append('price_per_day', formData.price_per_day);
            data.append('category_id', formData.category_id);
            data.append('quantity', formData.quantity);
            data.append('status', formData.status);

            await itemService.updateItem(item.item_id, data);
            toast.success('Item updated successfully');
            onUpdated();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update item');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#111827] rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Edit Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Item Name"
                        className="w-full border p-2 rounded"
                        value={formData.item_name}
                        onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        className="w-full border p-2 rounded"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Price (INR)</label>
                            <input
                                type="number"
                                className="w-full border p-2 rounded"
                                value={formData.price_per_day}
                                onChange={e => setFormData({ ...formData, price_per_day: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Total Quantity</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full border p-2 rounded"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Status</label>
                        <select
                            className="w-full border p-2 rounded text-sm"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable (Hidden)</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-50 dark:bg-gray-800/60 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
const MyShop = () => {
    const [shop, setShop] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchShopData();
    }, []);

    const fetchShopData = async () => {
        try {
            const shopData = await shopService.getMyShop();
            setShop(shopData);
            if (shopData && shopData.shop_id) {
                const itemsData = await itemService.getItemsByShop(shopData.shop_id);
                setItems(itemsData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await itemService.deleteItem(itemId);
            setItems(items.filter(item => item.item_id !== itemId));
            toast.success('Item deleted');
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (!shop) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <h2 className="text-2xl font-bold mb-4">You don't have a shop yet.</h2>
                <Link
                    to="/shop/register"
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                >
                    Register Your Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white dark:bg-[#111827] rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{shop.shop_name}</h1>
                        <p className="text-gray-600 mt-2">{shop.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Status: <span className={`font-semibold ${shop.status === 'approved' ? 'text-green-600' :
                                shop.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                }`}>{shop.status.toUpperCase()}</span>
                        </p>
                    </div>
                    {shop.status === 'approved' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            + Add Item
                        </button>
                    )}
                </div>
            </div>

            {shop.status === 'approved' ? (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Your Inventory</h2>
                    {items.length === 0 ? (
                        <p className="text-gray-500">No items listed yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map(item => (
                                <div key={item.item_id} className="bg-white dark:bg-[#111827] rounded shadow p-4">
                                    {item.image_url && (
                                        <img src={item.image_url} alt={item.item_name} className="w-full h-48 object-cover rounded mb-4" />
                                    )}
                                    <h3 className="text-xl font-semibold">{item.item_name}</h3>
                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="font-bold text-emerald-600">₹{item.price_per_day} / day</p>
                                        <p className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">Qty: {item.quantity_available || 1}</p>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button 
                                            onClick={() => setEditingItem(item)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.item_id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Your shop is currently {shop.status}.
                                {shop.status === 'pending' ? ' Please wait for admin approval to start listing items.' : ' Contact support for more info.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <AddItemModal onClose={() => setIsAddModalOpen(false)} onAdded={() => {
                    fetchShopData();
                    setIsAddModalOpen(false);
                }} shopId={shop.shop_id} />
            )}

            {editingItem && (
                <EditItemModal 
                    item={editingItem} 
                    onClose={() => setEditingItem(null)} 
                    onUpdated={() => {
                        fetchShopData();
                        setEditingItem(null);
                    }} 
                />
            )}
        </div>
    );
};

export default MyShop;
