import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Menu, Search, Bell, User } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Component */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">

                {/* Top Header */}
                <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-100">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 lg:hidden"
                        onClick={toggleSidebar}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex max-w-lg items-center">
                            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                    <Search size={20} />
                                </div>
                                <input
                                    name="search"
                                    id="search"
                                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm bg-transparent"
                                    placeholder="Search rentals..."
                                    type="search"
                                />
                            </div>
                        </div>
                        <div className="ml-4 flex items-center md:ml-6 space-x-4">
                            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                                <span className="sr-only">View notifications</span>
                                <Bell size={20} />
                            </button>

                            {/* Profile Dropdown / Link (Simplified for now) */}
                            {user ? (
                                <Link to="/profile" className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-bold">
                                        {user.fullname.charAt(0).toUpperCase()}
                                    </div>
                                </Link>
                            ) : (
                                <Link to="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
