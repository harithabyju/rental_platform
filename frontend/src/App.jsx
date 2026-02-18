import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OTP from './pages/OTP';
import Profile from './pages/Profile';
import AdminUserManagement from './pages/AdminUserManagement';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />; // Or unauthorized page
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Landing />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="otp" element={<OTP />} />

                        <Route
                            path="profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="admin/users"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminUserManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="book/:itemId"
                            element={
                                <ProtectedRoute allowedRoles={['customer', 'renter']}>
                                    <BookingPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="my-bookings"
                            element={
                                <ProtectedRoute>
                                    <MyBookingsPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Routes>
                <ToastContainer />
            </AuthProvider>
        </Router>
    );
}

export default App;
