import React, { useState, useEffect } from 'react';
import {
    Users,
    Store,
    TrendingUp,
    Clock,
    Settings,
    AlertCircle,
    ShieldAlert,
    Layers,
    ArrowRight
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import adminService from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await adminService.getDashboardData();
                if (response.success) {
                    setData(response.data);
                } else {
                    setError('Failed to fetch dashboard data');
                }
            } catch (err) {
                console.error(err);
                setError('Something went wrong. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
            </div>
        );
    }

    const COLORS = ['#10b981', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Monitor your platform's performance at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Customers"
                    value={data.stats.totalCustomers}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Shops"
                    value={data.stats.totalShops}
                    icon={<Store className="w-6 h-6" />}
                    color="bg-green-500"
                />
                <StatCard
                    title="Platform Revenue"
                    value={`₹${data.stats.totalRevenue.toLocaleString()}`}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Active Rentals"
                    value={data.stats.activeRentals}
                    icon={<Clock className="w-6 h-6" />}
                    color="bg-purple-500"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Quick Management</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ActionButton icon={<Layers />} label="Categories" onClick={() => navigate('/admin/categories')} color="text-emerald-600 bg-emerald-50" />
                    <ActionButton icon={<ShieldAlert />} label="Fine Management" onClick={() => navigate('/admin/fines')} color="text-red-600 bg-red-50" />
                    <ActionButton icon={<Users />} label="Users" onClick={() => navigate('/admin/users')} color="text-blue-600 bg-blue-50" />
                    <ActionButton icon={<Store />} label="Shops" onClick={() => navigate('/admin/shops')} color="text-emerald-600 bg-emerald-50" />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend Line Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Revenue Trend (Monthly)</h3>
                    <div className="h-[300px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.charts.revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bookings by Category Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Bookings by Category</h3>
                    <div className="h-[300px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.bookingsByCategory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="category" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="booking_count" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Inventory Category Distribution</h3>
                    <div className="h-[300px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.charts.categoryDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.charts.categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performing Shops Table Wrapper */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Top Performing Shops</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 font-semibold rounded-l-lg">Shop</th>
                                    <th className="px-4 py-3 font-semibold text-center">Items</th>
                                    <th className="px-4 py-3 font-semibold text-center">Rentals</th>
                                    <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.topShops.map((shop, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{shop.name}</div>
                                                <div className="text-xs text-gray-500">{shop.location}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm">{shop.totalItems}</td>
                                        <td className="px-4 py-4 text-center text-sm">{shop.totalRentals}</td>
                                        <td className="px-4 py-4 text-right text-sm font-semibold text-emerald-600">
                                            ₹{shop.earnings.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
            </div>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            {React.cloneElement(icon, { size: 80 })}
        </div>
    </div>
);

const ActionButton = ({ icon, label, onClick, color }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-between p-4 rounded-xl font-medium transition-all hover:ring-2 hover:ring-offset-2 hover:scale-[1.02] active:scale-95 ${color}`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
        </div>
        <ArrowRight size={16} />
    </button>
);

export default AdminDashboard;
