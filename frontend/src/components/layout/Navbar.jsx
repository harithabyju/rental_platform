import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, LogOut, User, Menu, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import SplitText from '../SplitText';
import notificationService from '../../services/notificationService';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
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
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-red-600 rounded-full border-2 border-white dark:border-[#111827] text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                                    {unreadCount}
                                </span>
                            )}

                            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-3 z-50 overflow-hidden transform origin-top-right scale-95 group-hover:scale-100 duration-200">
                                <div className="px-5 pb-3 border-b border-gray-100 dark:border-gray-700 mb-2 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 py-4 -mt-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 italic">Recent Alerts</h4>
                                    {unreadCount > 0 && <span className="text-[10px] font-bold text-red-500 uppercase">{unreadCount} New</span>}
                                </div>
                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar px-2 space-y-2 pb-2">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center bg-gray-50/50 dark:bg-gray-800/10 rounded-2xl m-2 border border-dashed border-gray-200 dark:border-gray-700/50">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Bell className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">No notifications yet</p>
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                                className={`px-4 py-4 rounded-2xl transition-all group/item relative overflow-hidden border border-transparent ${
                                                    !notif.is_read 
                                                    ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 shadow-sm' 
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:border-gray-100 dark:hover:border-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                        notif.type === 'error' ? 'bg-rose-500/20 text-rose-500' :
                                                        notif.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                                                        notif.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
                                                        'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                        {notif.is_read ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h5 className={`text-xs font-black truncate pr-4 ${!notif.is_read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
                                                                {notif.title}
                                                            </h5>
                                                            <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(notif.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className={`text-[11px] leading-relaxed mb-1 ${!notif.is_read ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400'}`}>
                                                            {notif.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!notif.is_read && (
                                                    <div className="absolute top-0 right-0 h-full w-1 bg-emerald-500/50"></div>
                                                )}
                                            </div>
                                        ))
                                    )}
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
