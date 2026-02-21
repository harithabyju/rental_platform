import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OTP from './pages/OTP';
import Profile from './pages/Profile';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import ShopOwnerDashboard from './pages/shop-owner/ShopOwnerDashboard';
import CustomerHome from './pages/customer/CustomerHome';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

const AuthRedirect = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/dashboard" />;
    return children;
};

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <DashboardProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<AuthRedirect><Landing /></AuthRedirect>} />
                            <Route path="login" element={<AuthRedirect><Login /></AuthRedirect>} />
                            <Route path="register" element={<AuthRedirect><Register /></AuthRedirect>} />
                            <Route path="otp" element={<AuthRedirect><OTP /></AuthRedirect>} />

                            {/* Dashboard Routes */}
                            <Route
                                path="dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['customer']}>
                                        <CustomerDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="dashboard/browse"
                                element={
                                    <ProtectedRoute>
                                        <BrowseItems />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="dashboard/item/:itemId/shops"
                                element={
                                    <ProtectedRoute>
                                        <ItemShops />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="dashboard/bookings"
                                element={
                                    <ProtectedRoute>
                                        <MyBookingsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="dashboard/payments"
                                element={
                                    <ProtectedRoute>
                                        <MyPayments />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="dashboard/rentals"
                                element={
                                    <ProtectedRoute>
                                        <ActiveRentals />
                                    </ProtectedRoute>
                                }
                            />

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
                            path="admin/categories"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <CategoryManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="shop-owner/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['shop_owner']}>
                                    <ShopOwnerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="customer/home"
                            element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <CustomerHome />
                                </ProtectedRoute>
                            }
                        />
                            <Route
                                path="dashboard/booking/:itemId"
                                element={
                                    <ProtectedRoute allowedRoles={['customer', 'renter']}>
                                        <BookingPage />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                    </Routes>
                </DashboardProvider>
                <ToastContainer />
            </AuthProvider>
        </Router>
    );
}

export default App;
