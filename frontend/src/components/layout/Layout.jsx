import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
        <div className="min-h-screen flex flex-col bg-gray-50">
            <CursorParticles />
            
            {/* Header / Navbar */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-400 hover:text-emerald-600 transition-colors lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <Link to="/" className="text-2xl font-black text-emerald-600 tracking-tight flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">G</div>
                             <span>Grab'N'Go</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/profile" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                {user.fullname.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden sm:inline text-sm font-bold text-gray-700">{user.fullname.split(' ')[0]}</span>
                        </Link>
                    </div>
                </nav>
            </header>

            <div className="flex flex-1 relative">
                {/* Sidebar - Fixed on desktop, slide-over on mobile */}
                <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

                {/* Main Content Area - offset by sidebar width on desktop */}
                <main className="flex-1 lg:pl-56 min-h-0 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-slide-up">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
