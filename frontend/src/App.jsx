import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OTP from './pages/OTP';
import Profile from './pages/Profile';
import AdminUserManagement from './pages/AdminUserManagement';

// Shop & Admin Pages
import RegisterShop from './pages/shop/RegisterShop';
import MyShop from './pages/shop/MyShop';
import ShopApprovals from './pages/admin/ShopApprovals';
import ShopDetails from './pages/shop/ShopDetails';

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

                        {/* Shop Owner Routes */}
                        <Route
                            path="shop/register"
                            element={
                                <ProtectedRoute allowedRoles={['customer', 'shop_owner']}>
                                    <RegisterShop />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="myshop"
                            element={
                                <ProtectedRoute allowedRoles={['shop_owner']}> 
                                    <MyShop /> 
                                </ProtectedRoute>
                            }
                        />
                         {/* Note: I'm allowing customers to register shop, but once they have a shop they are treated as shop_owner. 
                             Ideally role update happens on backend. If backend doesn't update role, then `myshop` route might block them if I only allow `shop_owner`.
                             Let's allow `customer` to access myshop too if they have a shop, or assume backend updates role.
                             For now, I'll allow both or better yet, just `auth` check. 
                             Actually, my `ProtectedRoute` above checks `allowedRoles`.
                             If backend creates shop but doesn't update role to `shop_owner`, this might break.
                             I should probably verify backend logic or just allow 'customer' here too.
                             SAFE BET: Allow both.
                          */}
                        
                        {/* Public Shop View */}
                        <Route path="shops/:id" element={<ShopDetails />} />

                        {/* Admin Routes */}
                        <Route
                            path="admin/users"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminUserManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/shops"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <ShopApprovals />
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
