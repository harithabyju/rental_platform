import { useState, useEffect } from 'react';
import authService from '../../services/authService';
import { Users, UserCheck, UserX, ShieldOff, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null); // userId being actioned

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await authService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId) => {
        setActionLoading(userId);
        try {
            await authService.blockUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: true } : u));
            toast.success('User blocked successfully');
        } catch (err) {
            toast.error('Failed to block user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnblockUser = async (userId) => {
        setActionLoading(userId);
        try {
            await authService.unblockUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: false } : u));
            toast.success('User unblocked successfully');
        } catch (err) {
            toast.error('Failed to unblock user');
        } finally {
            setActionLoading(null);
        }
    };

    const activeCount = users.filter(u => !u.blocked).length;
    const blockedCount = users.filter(u => u.blocked).length;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto py-20 px-4 text-center">
            <div className="bg-red-900/20 text-red-400 p-6 rounded-2xl border border-red-800/30 inline-block font-black">
                {error}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">User Management</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage all registered accounts on the platform</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-emerald-900/40 text-emerald-400 px-5 py-2.5 rounded-2xl font-black text-sm border border-emerald-700/30 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        {activeCount} Active
                    </div>
                    <div className="bg-red-900/40 text-red-400 px-5 py-2.5 rounded-2xl font-black text-sm border border-red-700/30 flex items-center gap-2">
                        <UserX className="w-4 h-4" />
                        {blockedCount} Blocked
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800/60">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em]">User</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em]">Email</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em]">Role</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em]">Joined</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em]">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">No users found</td>
                                </tr>
                            )}
                            {users.map((user, idx) => (
                                <tr key={user.id} className="group hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${user.blocked ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                                                {user.fullname?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.fullname}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm text-gray-500">{user.email}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${user.role === 'shop_owner' ? 'bg-blue-900/40 text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {user.role?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            {user.blocked ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-900/40 text-red-400 border border-red-700/30 w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Blocked
                                                </span>
                                            ) : user.verified ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-900/40 text-emerald-400 border border-emerald-700/30 w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Email Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-900/40 text-amber-400 border border-amber-700/30 w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending Email
                                                </span>
                                            )}
                                            {user.role === 'shop_owner' && (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit ${user.shop_status === 'approved' ? 'bg-blue-900/40 text-blue-400 border border-blue-700/30' :
                                                    user.shop_status === 'pending' ? 'bg-amber-900/40 text-amber-400 border border-amber-700/30' :
                                                        'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                    }`}>
                                                    Shop: {user.shop_status || 'None'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {user.blocked ? (
                                            <button
                                                onClick={() => handleUnblockUser(user.id)}
                                                disabled={actionLoading === user.id}
                                                className="inline-flex items-center gap-1.5 bg-emerald-900/40 text-emerald-400 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 border border-emerald-700/30 hover:border-emerald-600 disabled:opacity-50"
                                            >
                                                <Shield className="w-3.5 h-3.5" />
                                                {actionLoading === user.id ? 'Unblocking...' : 'Unblock'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBlockUser(user.id)}
                                                disabled={actionLoading === user.id}
                                                className="inline-flex items-center gap-1.5 bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 border border-red-700/30 hover:border-red-600 disabled:opacity-50"
                                            >
                                                <ShieldOff className="w-3.5 h-3.5" />
                                                {actionLoading === user.id ? 'Blocking...' : 'Block'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-black tracking-tight">Platform Safety Shield</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Block suspicious accounts instantly. Blocked users cannot log in or make bookings.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/10 px-6 py-4 rounded-2xl text-center min-w-[100px]">
                        <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
                        <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mt-1">Active</p>
                    </div>
                    <div className="bg-white/10 px-6 py-4 rounded-2xl text-center min-w-[100px]">
                        <p className="text-2xl font-black text-red-400">{blockedCount}</p>
                        <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mt-1">Blocked</p>
                    </div>
                    <div className="bg-white/10 px-6 py-4 rounded-2xl text-center min-w-[100px]">
                        <p className="text-2xl font-black text-blue-400">{users.length}</p>
                        <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mt-1">Total</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserManagement;
