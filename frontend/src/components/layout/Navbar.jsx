import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, LogOut, User, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import SplitText from '../SplitText';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#111827]/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-emerald-400 transition-colors lg:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo Branding */}
                    <Link to="/dashboard" className="flex items-center gap-3 flex-shrink-0 group">
                        <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-900/50 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 rounded-t-xl"></div>
                            <span className="text-xl italic relative z-10">G</span>
                        </div>
                        <div className="flex flex-col">
                            <SplitText text="Grab'N'Go" tag="span" className="text-lg font-black text-gray-900 dark:text-gray-100 leading-none tracking-tighter group-hover:text-emerald-400 transition-colors" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Premium Rentals</span>
                        </div>
                    </Link>

                    {/* Right Side */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Notifications */}
                        <div className="relative group cursor-pointer p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#111827]"></span>

                            <div className="absolute right-0 mt-3 w-72 bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-3 z-50">
                                <div className="px-4 pb-2 border-b border-gray-700 mb-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Notifications</h4>
                                </div>
                                <div className="px-4 py-3 text-center">
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Bell className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">No new notifications</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-gray-700 mx-1 hidden sm:block"></div>

                        {/* User Profile Block */}
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-emerald-900/50 border-2 border-emerald-700/30 shadow-sm flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-sm font-black text-gray-800 dark:text-gray-200 leading-none group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{user?.fullname}</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                        {String(user?.role || 'User').replace('_', ' ')}
                                    </span>
                                </div>
                            </Link>

                            <div className="h-6 w-px bg-gray-700 mx-1 hidden sm:block"></div>
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
