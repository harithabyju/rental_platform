import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            if (data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (data.user.role === 'shop_owner') {
                navigate('/shop-owner/dashboard');
            } else {
                navigate('/profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0B0F19]">
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>
            <div className="bg-white dark:bg-[#111827] p-10 rounded-3xl shadow-2xl shadow-black/40 w-full max-w-md border border-gray-100 dark:border-gray-800/60">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-lg shadow-emerald-900/50">G</div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Sign in to your Grab'N'Go account</p>
                </div>
                {error && (
                    <div className="bg-red-900/20 text-red-400 p-4 rounded-xl mb-6 border border-red-800/30 text-sm font-medium">
                        {error}
                        {error.includes('verify') && (
                            <div className="mt-2 text-sm">
                                <Link to="/otp" state={{ email }} className="underline font-bold text-emerald-400">Go to verification page</Link>
                            </div>
                        )}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field py-3"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field py-3"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
                    >
                        Sign In
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-500 text-sm">
                    Don't have an account? <Link to="/register" className="text-emerald-400 hover:underline font-bold">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
