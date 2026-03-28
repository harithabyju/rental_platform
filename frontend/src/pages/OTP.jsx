import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ThemeToggle from '../components/ThemeToggle';

const OTP = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const { verifyOtp } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await verifyOtp(email, otp);
            toast.success("User registered successfully! Please login.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    if (!email) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0B0F19]">
                <p className="text-gray-500 dark:text-gray-400 font-medium">Invalid access. Please register first.</p>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0B0F19] py-12 px-4">
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>
            <div className="bg-white dark:bg-[#111827] p-10 rounded-3xl shadow-2xl shadow-black/40 w-full max-w-md border border-gray-100 dark:border-gray-800/60">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-lg shadow-emerald-900/50">G</div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Verify Email</h2>
                    <p className="text-gray-500 text-sm mt-2 font-medium">
                        Enter the OTP sent to <span className="text-emerald-400 font-bold">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/20 text-red-400 p-4 rounded-xl mb-6 border border-red-800/30 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">One-Time Password</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="input-field py-3 text-center text-2xl tracking-[0.5em] font-black"
                            placeholder="······"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
                    >
                        Verify & Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTP;
