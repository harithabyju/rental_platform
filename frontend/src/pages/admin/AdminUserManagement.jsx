import { useState, useEffect } from 'react';
import authService from '../../services/authService';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await authService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            await authService.blockUser(userId);
            // Refresh users or update local state
            fetchUsers();
        } catch (err) {
            alert('Failed to block user');
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto py-20 px-4 text-center">
            <div className="bg-red-50 text-red-700 p-6 rounded-[2rem] border-2 border-red-100 inline-block font-black">
                {error}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 animate-fade-in">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage platform users and their access levels</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-6 py-2 rounded-2xl font-black text-sm border-2 border-emerald-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {users.length} Active Users
                </div>
            </div>

            <div className="card overflow-hidden border-none shadow-2xl shadow-gray-100 mb-10">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">User Identity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Email Address</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Access Role</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Verification</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Governance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user, idx) => (
                                <tr key={user.id} className="group hover:bg-emerald-50/30 transition-colors animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center font-black text-emerald-700">
                                                {user.fullname?.charAt(0) || 'U'}
                                            </div>
                                            <div className="text-sm font-black text-gray-900">{user.fullname}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {user.blocked ? (
                                                <span className="flex items-center gap-1.5 text-red-600 text-xs font-black uppercase tracking-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                    Blacklisted
                                                </span>
                                            ) : user.verified ? (
                                                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-amber-500 text-xs font-black uppercase tracking-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {!user.blocked ? (
                                            <button
                                                onClick={() => handleBlockUser(user.id)}
                                                className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border-2 border-red-100 hover:border-red-600"
                                            >
                                                Restrict Access
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border-2 border-gray-100">
                                                Restricted
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-gray-900 rounded-[2rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-gray-800 shadow-2xl">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black tracking-tight">Platform Safety Shield</h2>
                    <p className="text-gray-400 font-medium mt-2 max-w-md">Admin controls allow for immediate account restriction and verification overwatch to maintain community standards.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl text-center min-w-[120px]">
                        <p className="text-3xl font-black text-emerald-400">99.9%</p>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-tighter mt-1">Safety Record</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserManagement;
