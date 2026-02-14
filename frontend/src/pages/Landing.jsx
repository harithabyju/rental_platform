import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center px-4">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
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
                    className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition"
                >
                    Login
                </Link>
            </div>
        </div>
    );
};

export default Landing;
