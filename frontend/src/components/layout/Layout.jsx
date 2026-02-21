import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
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
                <main className="animate-fade-in">
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">

            {/* Modular Navbar */}
            <Navbar />


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
