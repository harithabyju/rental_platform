import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-4">
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
                Rent Anything, <span className="text-primary">Anytime</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                The ultimate multi-vendor platform for renting electronics, furniture, fashion, and more.
            </p>
            <div className="flex space-x-4">
                <Link
                    to="/register"
                    className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition"
                >
                    Get Started
                </Link>
                <Link
                    to="/login"
                    className="bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 border border-gray-300 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:bg-gray-800/40 transition"
                >
                    Login
                </Link>
            </div>
        </div>
    );
};

export default Landing;
