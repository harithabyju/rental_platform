import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OTP from './pages/OTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyBookingsPage from './pages/MyBookingsPage';
import Profile from './pages/Profile';
import AdminUserManagement from './pages/admin/AdminUserManagement';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShops from './pages/admin/AdminShops';
import CategoryManagement from './pages/admin/CategoryManagement';
import ShopApprovals from './pages/admin/ShopApprovals';
import AdminItems from './pages/admin/AdminItems';
import ShopOwnerDashboard from './pages/shop-owner/ShopOwnerDashboard';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerDashboard from './pages/CustomerDashboard';
import BrowseItems from './pages/BrowseItems';
import ItemShops from './pages/ItemShops';
import MyPayments from './pages/MyPayments';
import ActiveRentals from './pages/ActiveRentals';
import BookingProcess from './pages/BookingProcess';
// Trace Comment: App.jsx version 1.0.2 - Renamed to BookingProcess

// fine-module imports
import AdminFineDashboard from './pages/admin/AdminFineDashboard';
import AdminDisputePanel from './pages/admin/AdminDisputePanel';
import ReportDamage from './pages/owner/ReportDamage';
import MyFines from './pages/customer/MyFines';
import RaiseDispute from './pages/customer/RaiseDispute';
import ComplianceAdminDashboard from './pages/admin/ComplianceDashboard';
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
    if (user) {
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
        if (user.role === 'shop_owner') return <Navigate to="/shop-owner/dashboard" />;
        return <Navigate to="/dashboard" />;
    }
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
                            <Route path="forgot-password" element={<AuthRedirect><ForgotPassword /></AuthRedirect>} />
                            <Route path="reset-password" element={<AuthRedirect><ResetPassword /></AuthRedirect>} />

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
                                path="dashboard/booking/:itemId"
                                element={
                                    <ProtectedRoute>
                                        <BookingProcess />
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
                            path="admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminDashboard />
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
                            path="admin/shops"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminShops />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="admin/approvals"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <ShopApprovals />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="admin/items"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminItems />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="owner/report-damage/:bookingId"
                            element={
                                <ProtectedRoute allowedRoles={['shop_owner']}>
                                    <ReportDamage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="fines"
                            element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <MyFines />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/compliance"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <ComplianceAdminDashboard />
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
                            path="dispute/:fineId"
                            element={
                                <ProtectedRoute allowedRoles={['customer']}>
                                    <RaiseDispute />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="admin/fines"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminFineDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="admin/disputes"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminDisputePanel />
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
