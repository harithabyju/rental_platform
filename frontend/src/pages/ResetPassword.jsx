import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ThemeToggle from '../components/ThemeToggle';
import SplitText from '../components/SplitText';

const ResetPassword = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
            toast.success('Password reset successfully! Please login with your new password.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
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
                    <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Reset Password</h2>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Enter your OTP and new password</p>
                </div>
                {error && (
                    <div className="bg-red-900/20 text-red-400 p-4 rounded-xl mb-6 border border-red-800/30 text-sm font-medium">
                        {error}
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
                        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="input-field py-3"
                            placeholder="Enter 6-digit OTP"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field py-3"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
