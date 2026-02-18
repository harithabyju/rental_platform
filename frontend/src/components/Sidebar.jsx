import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, LogOut, Grid, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        ...(user ? [
            { path: '/my-bookings', label: 'My Bookings', icon: Calendar },
            { path: '/profile', label: 'Profile', icon: User },
        ] : []),
        ...(user && user.role === 'admin' ? [
            { path: '/admin/users', label: 'Manage Users', icon: Settings },
        ] : []),
    ];

    // Placeholder categories for future module
    const categories = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Furniture' },
        { id: 3, name: 'Vehicles' },
        { id: 4, name: 'Tools' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSidebar}
            />

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Area */}
                <div className="flex items-center justify-center h-16 border-b border-gray-100">
                    <Link to="/" className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                        <Grid size={24} />
                        <span>Grab'N'Go</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col flex-grow p-4 overflow-y-auto">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()} // Close on mobile click
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${isActive(item.path) ? 'text-emerald-500' : 'text-gray-400'}`} />
                                {item.label}
                            </Link>
                        ))}
                        {user && (
                            <Link
                                to="/book/1"
                                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                                <BookOpen className="mr-3 h-5 w-5 text-gray-400" />
                                <span className="flex-1">Book Item (Test)</span>
                                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">New</span>
                            </Link>
                        )}
                    </nav>

                    {/* Categories Section (Future Module Placeholder) */}
                    <div className="mt-8">
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Browse Categories
                        </h3>
                        <div className="mt-2 space-y-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 group"
                                >
                                    <span className="w-2 h-2 mr-3 bg-gray-300 rounded-full group-hover:bg-emerald-400 transition-colors"></span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / Logout */}
                {user ? (
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center mb-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mr-3">
                                {user.fullname.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.fullname}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="p-4 border-t border-gray-100">
                        <Link to="/login" className="flex items-center justify-center w-full btn-primary mb-2">
                            Login
                        </Link>
                        <Link to="/register" className="flex items-center justify-center w-full btn-secondary">
                            Register
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
