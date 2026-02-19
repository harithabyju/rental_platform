import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CursorParticles from './CursorParticles';
import { useState } from 'react';
import { Menu } from 'lucide-react';

// Routes where we show the old sidebar layout (pre-login)
const SIDEBAR_ROUTES = ['/', '/login', '/register', '/otp'];

const Layout = () => {
    const { user } = useAuth();
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
        <div className="min-h-screen bg-gray-50 flex">
            <CursorParticles />
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300`}>
                <header className="sticky top-0 z-40 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-100">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    {/* Header search/notification placeholder */}
                    <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex items-center">
                            <span className="text-gray-400 text-sm hidden sm:block">Search for rentals, items, shops...</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-slide-up">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
