import { useState, useEffect } from 'react';
import authService from '../../services/authService';
import { Store, Package, TrendingUp, DollarSign, Users, MapPin, AlertCircle } from 'lucide-react';

const AdminShops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const res = await authService.getShopsAnalytics();
                const data = res?.data || res;
                setShops(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Failed to load shop analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
        </div>
    );

    // Summary totals
    const totalRevenue = shops.reduce((s, sh) => s + parseFloat(sh.total_revenue || 0), 0);
    const totalItems = shops.reduce((s, sh) => s + parseInt(sh.total_items || 0), 0);
    const totalRentals = shops.reduce((s, sh) => s + parseInt(sh.total_rentals || 0), 0);

    const fmtINR = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shop Analytics</h1>
                <p className="text-gray-500 font-medium mt-1">Performance overview for all approved shops on the platform</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Store className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-sm font-bold text-gray-500">Total Shops</p>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{shops.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm font-bold text-gray-500">Total Items</p>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{totalItems}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-sm font-bold text-gray-500">Platform Revenue</p>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{fmtINR(totalRevenue)}</p>
                </div>
            </div>

            {/* Shops Table */}
            {shops.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-gray-200" />
                    </div>
                    <h3 className="text-base font-bold text-gray-700">No approved shops yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Shops will appear here once they are approved</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Shop</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Owner</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Items</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Rentals</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {shops.map((shop, idx) => (
                                    <tr key={shop.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center font-black text-emerald-700">
                                                    {shop.name?.charAt(0)?.toUpperCase() || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{shop.name}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                        <MapPin className="w-3 h-3" />
                                                        {shop.city}{shop.state ? `, ${shop.state}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{shop.owner_name}</p>
                                                <p className="text-xs text-gray-400">{shop.owner_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 text-sm font-black">
                                                {shop.total_items}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-700 text-sm font-black">
                                                {shop.total_rentals}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-sm font-black text-emerald-600">
                                                {fmtINR(shop.total_revenue)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {/* Totals Row */}
                            <tfoot>
                                <tr className="bg-gray-900 text-white">
                                    <td className="px-6 py-4 font-black text-sm" colSpan={2}>Platform Totals</td>
                                    <td className="px-6 py-4 text-center font-black text-sm">{totalItems}</td>
                                    <td className="px-6 py-4 text-center font-black text-sm">{totalRentals}</td>
                                    <td className="px-6 py-4 text-right font-black text-emerald-400">{fmtINR(totalRevenue)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShops;
