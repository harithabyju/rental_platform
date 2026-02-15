import { useEffect, useState } from 'react';
import shopService from '../../services/shop.service';
import { toast } from 'react-toastify';

const ShopApprovals = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingShops();
    }, []);

    const fetchPendingShops = async () => {
        try {
            const data = await shopService.getAllShops('pending');
            setShops(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch pending shops');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (shopId) => {
        try {
            await shopService.approveShop(shopId);
            toast.success('Shop approved');
            setShops(shops.filter(shop => shop.shop_id !== shopId));
        } catch (error) {
            toast.error('Failed to approve shop');
        }
    };

    const handleReject = async (shopId) => {
        if (!window.confirm('Reject this shop?')) return;
        try {
            await shopService.rejectShop(shopId);
            toast.success('Shop rejected');
            setShops(shops.filter(shop => shop.shop_id !== shopId));
        } catch (error) {
            toast.error('Failed to reject shop');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Pending Shop Approvals</h1>
            {shops.length === 0 ? (
                <p className="text-gray-500">No pending shops found.</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shops.map(shop => (
                                <tr key={shop.shop_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{shop.shop_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 max-w-xs truncate">{shop.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {shop.location?.city}, {shop.location?.zip}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button 
                                            onClick={() => handleApprove(shop.shop_id)}
                                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleReject(shop.shop_id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ShopApprovals;
