import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CursorParticles from './CursorParticles';
import { useState } from 'react';
import { Menu } from 'lucide-react';

// Routes where we show the old sidebar layout (pre-login)
const SIDEBAR_ROUTES = ['/', '/login', '/register', '/otp'];

const Layout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <CursorParticles />
                <main className="animate-fade-in">
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-primary">Grab'N'Go</Link>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/profile" className="text-gray-700 hover:text-primary">Profile</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin/users" className="text-gray-700 hover:text-primary">Manage Users</Link>
                                )}
                                <button
                                    onClick={logout}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-primary">Login</Link>
                                <Link
                                    to="/register"
                                    className="bg-primary text-white px-4 py-2 rounded hover:bg-green-600 transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-slide-up">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
