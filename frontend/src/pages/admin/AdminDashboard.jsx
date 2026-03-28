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
            <div className="bg-red-900/20 border border-red-800/30 p-4 rounded-xl flex items-center gap-3 text-red-400">
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Monitor your platform's performance at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Total Users"
                    value={data.stats.totalUsers}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-indigo-500"
                    onClick={() => navigate('/admin/users')}
                />
                <StatCard
                    title="Customers"
                    value={data.stats.totalCustomers}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Approved Shops"
                    value={data.stats.totalShops}
                    icon={<Store className="w-6 h-6" />}
                    color="bg-green-500"
                />
                <StatCard
                    title="Pending Appr."
                    value={data.stats.pendingApprovals}
                    icon={<Clock className="w-6 h-6" />}
                    color={data.stats.pendingApprovals > 0 ? "bg-amber-500 animate-pulse" : "bg-gray-400"}
                    onClick={() => navigate('/admin/shops')}
                />
                <StatCard
                    title="Revenue"
                    value={`₹${data.stats.totalRevenue.toLocaleString()}`}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="bg-purple-500"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Quick Management</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ActionButton icon={<Layers />} label="Categories" onClick={() => navigate('/admin/categories')} color="text-emerald-400 bg-emerald-900/40 hover:bg-emerald-900/70" />
                    <ActionButton icon={<ShieldAlert />} label="Fine Management" onClick={() => navigate('/admin/fines')} color="text-red-400 bg-red-900/40 hover:bg-red-900/70" />
                    <ActionButton icon={<Users />} label="Users" onClick={() => navigate('/admin/users')} color="text-blue-400 bg-blue-900/40 hover:bg-blue-900/70" />
                    <ActionButton icon={<Store />} label="Shops" onClick={() => navigate('/admin/shops')} color="text-emerald-400 bg-emerald-900/40 hover:bg-emerald-900/70" />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend Line Chart */}
                <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Revenue Trend (Monthly)</h3>
                    <div className="h-[300px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.charts.revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #374151', background: '#1f2937', color: '#f3f4f6' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Registration Trend Chart */}
                <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Registration Trend</h3>
                    <div className="h-[300px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.registrationTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff10' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #374151', background: '#1f2937', color: '#f3f4f6' }}
                                />
                                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bookings by Category Bar Chart */}
                <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Bookings by Category</h3>
                    <div className="h-[300px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.bookingsByCategory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff10' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #374151', background: '#1f2937', color: '#f3f4f6' }}
                                />
                                <Bar dataKey="booking_count" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution Pie Chart */}
                <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Inventory Category Distribution</h3>
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
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #374151', background: '#1f2937', color: '#f3f4f6' }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#9ca3af' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performing Shops Table Wrapper */}
                <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Top Performing Shops</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 font-semibold rounded-l-lg">Shop</th>
                                    <th className="px-4 py-3 font-semibold text-center">Items</th>
                                    <th className="px-4 py-3 font-semibold text-center">Rentals</th>
                                    <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                                {data.topShops.map((shop, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:bg-gray-800/40 transition-colors">
                                        <td className="px-4 py-4">
                                            <div>
                                                <div className="font-medium text-gray-800 dark:text-gray-200">{shop.name}</div>
                                                <div className="text-xs text-gray-500">{shop.location}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{shop.totalItems}</td>
                                        <td className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{shop.totalRentals}</td>
                                        <td className="px-4 py-4 text-right text-sm font-semibold text-emerald-400">
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

const StatCard = ({ title, value, icon, color, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 relative overflow-hidden group hover:border-emerald-700/40 transition-all ${onClick ? 'cursor-pointer hover:shadow-lg hover:shadow-black/20' : ''}`}
    >
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
                <h4 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">{value}</h4>
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
        className={`flex items-center justify-between p-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 ${color}`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
        </div>
        <ArrowRight size={16} />
    </button>
);

export default AdminDashboard;
