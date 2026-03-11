import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, User, LogOut, Grid, BookOpen, Settings, BarChart2, Users, Tag, Store, Package, DollarSign, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        if (['/dashboard', '/admin/dashboard', '/shop-owner/dashboard'].includes(path)) {
            return location.pathname === path;
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const navConfig = {
        admin: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart2 },
            { path: '/admin/categories', label: 'Categories', icon: Tag },
            { path: '/admin/users', label: 'User Management', icon: Users },
            { path: '/admin/approvals', label: 'Approval Hub', icon: ClipboardCheck },
            { path: '/admin/shops', label: 'Performance Hub', icon: Store },
            { path: '/admin/items', label: 'Item Control', icon: Package },
        ],
        shop_owner: [
            { path: '/shop-owner/dashboard', label: 'My Shop', icon: Store },
            { path: '/profile', label: 'Profile', icon: User },
        ],
        customer: [
            { path: '/dashboard', label: 'Dashboard', icon: Grid },
            { path: '/dashboard/bookings', label: 'My Bookings', icon: Calendar },
            { path: '/dashboard/rentals', label: 'Active Rentals', icon: Package },
            { path: '/dashboard/payments', label: 'Payments', icon: DollarSign },
            { path: '/profile', label: 'Profile', icon: User },
        ],
    };

    const navItems = navConfig[user?.role] || navConfig.customer;

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSidebar}
            />

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-56 bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-gray-800/60 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {/* Logo Area */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-gray-800/60">
                    <Link to="/" className="text-lg font-black text-emerald-400 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-900/50">G</div>
                        <span>Grab'N'Go</span>
                    </Link>
                </div>

                {/* Role Badge */}
                <div className="px-4 py-3 border-b border-gray-800/40">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-900/50 text-purple-300 border border-purple-700/30' :
                        user.role === 'shop_owner' ? 'bg-amber-900/50 text-amber-300 border border-amber-700/30' :
                            'bg-emerald-900/50 text-emerald-300 border border-emerald-700/30'
                        }`}>
                        {user.role === 'shop_owner' ? 'Shop Owner' : user.role}
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col flex-grow p-3 overflow-y-auto">
                    <nav className="space-y-1">
                        {navItems.map((item, index) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${isActive(item.path)
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-800/60 hover:text-gray-800 dark:text-gray-200'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-300'}`} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Browse Items for customer */}
                    {(user.role === 'customer') && (
                        <div className="mt-4 pt-4 border-t border-gray-800/40">
                            <p className="px-3 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Discover</p>
                            <Link
                                to="/dashboard/browse"
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${isActive('/dashboard/browse')
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-800/60 hover:text-gray-800 dark:text-gray-200'
                                    }`}
                            >
                                <BookOpen className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive('/dashboard/browse') ? 'text-white' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-300'}`} />
                                Explore Items
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer User Profile */}
                <div className="p-3 border-t border-gray-100 dark:border-gray-800/60">
                    <div className="flex items-center mb-3 px-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold mr-2.5 shadow-md flex-shrink-0">
                            {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{user?.fullname || 'User'}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user?.email || '-'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-bold text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all active:scale-95 border border-red-500/20"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
