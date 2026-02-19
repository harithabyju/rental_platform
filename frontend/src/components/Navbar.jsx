import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User, LayoutDashboard, Calendar, CreditCard, Package, Search } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/dashboard/browse', label: 'Browse', icon: Search },
        { path: '/dashboard/bookings', label: 'My Bookings', icon: Calendar },
        { path: '/dashboard/payments', label: 'Payments', icon: CreditCard },
        { path: '/dashboard/rentals', label: 'Active Rentals', icon: Package },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">RentalHub</span>
                    </Link>

                    {/* Nav Links - Desktop */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const active = link.exact
                                ? location.pathname === link.path
                                : isActive(link.path) && link.path !== '/dashboard';
                            const dashboardActive = link.path === '/dashboard' && location.pathname === '/dashboard';
                            const isLinkActive = link.exact ? dashboardActive : isActive(link.path);

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isLinkActive
                                            ? 'bg-violet-100 text-violet-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Notification Bell */}
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                    {user?.fullname?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-900 leading-none">{user?.fullname}</p>
                                    <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
                                </div>
                            </button>

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20">
                                        <Link
                                            to="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <User className="w-4 h-4 text-gray-400" />
                                            Profile
                                        </Link>
                                        <hr className="my-1 border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
                    {navLinks.map((link) => {
                        const isLinkActive = link.exact
                            ? location.pathname === link.path
                            : isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${isLinkActive
                                        ? 'bg-violet-100 text-violet-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <link.icon className="w-3.5 h-3.5" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
