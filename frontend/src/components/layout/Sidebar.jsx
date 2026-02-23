import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, User, LogOut, Grid, BookOpen, Settings, BarChart2, Users, Tag, Store, Package, DollarSign, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    // Role-specific navigation links
    const navConfig = {
        admin: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart2 },
            { path: '/admin/categories', label: 'Categories', icon: Tag },
            { path: '/admin/users', label: 'User Management', icon: Users },
            { path: '/admin/approvals', label: 'Shop Approvals', icon: ClipboardCheck },
            { path: '/admin/shops', label: 'Shop Analytics', icon: Store },
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
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSidebar}
            />

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {/* Logo Area */}
                <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
                    <Link to="/" className="text-lg font-black text-emerald-600 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">G</div>
                        <span>Grab'N'Go</span>
                    </Link>
                </div>

                {/* Role Badge */}
                <div className="px-4 py-3 border-b border-gray-50">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'shop_owner' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
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
                                className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                                    isActive(item.path)
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Browse Items for customer/shop_owner */}
                    {(user.role === 'customer') && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discover</p>
                            <Link
                                to="/dashboard/browse"
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                                    isActive('/dashboard/browse')
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <BookOpen className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive('/dashboard/browse') ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                Explore Items
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer User Profile */}
                <div className="p-3 border-t border-gray-100">
                    <div className="flex items-center mb-3 px-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold mr-2.5 shadow-md flex-shrink-0">
                            {user.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.fullname}</p>
                            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all active:scale-95"
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
