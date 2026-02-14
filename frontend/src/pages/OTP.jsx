import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
        return <div className="text-center mt-10">Invalid access. Please register first.</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
                <p className="mb-4 text-center text-gray-600">Enter the OTP sent to {email}</p>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full mt-1 p-2 border rounded focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded hover:bg-green-600 transition"
                    >
                        Verify
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTP;
