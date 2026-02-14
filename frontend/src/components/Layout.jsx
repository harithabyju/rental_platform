import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
                                    onClick={handleLogout}
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
            <main className="flex-grow bg-gray-50">
                <Outlet />
            </main>
            <footer className="bg-gray-800 text-white py-6 text-center">
                <p>&copy; 2024 Grab'N'Go. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
