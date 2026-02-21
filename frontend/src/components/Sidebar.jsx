import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, LogOut, Grid, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        ...(user ? [
            { path: '/dashboard', label: 'Dashboard', icon: Grid },
            { path: '/dashboard/bookings', label: 'My Bookings', icon: Calendar },
            { path: '/profile', label: 'Profile', icon: User },
        ] : []),
    ];

    // Placeholder categories for future module
    const categories = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Furniture' },
        { id: 3, name: 'Vehicles' },
        { id: 4, name: 'Tools' },
    ];

    if (!user) return null; // Only show after login

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSidebar}
            />

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} animate-fade-in`}>
                {/* Logo Area */}
                <div className="flex items-center justify-center h-16 border-b border-gray-100">
                    <Link to="/dashboard" className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                        <Grid size={24} className="animate-pulse" />
                        <span>Grab'N'Go</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col flex-grow p-4 overflow-y-auto">
                    <nav className="space-y-1">
                        {navItems.map((item, index) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()} // Close on mobile click
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group animate-slide-up hover-tilt active-press active-pop ${isActive(item.path)
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-[1.02]'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                                    }`}
                                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                            >
                                <item.icon className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>


                    {/* Quick Action */}
                    <Link
                        to="/dashboard/browse"
                        className="mt-4 flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                    >
                        <BookOpen className="mr-3 h-5 w-5 text-gray-400 group-hover:text-emerald-500" />
                        <span className="flex-1">Explore Items</span>
                    </Link>
                </div>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center mb-3 px-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                            {user.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.fullname}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all active:scale-95"
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
