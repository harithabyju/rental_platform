import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Basic validation for stored user object
                if (parsedUser && parsedUser.id && (parsedUser.fullname || parsedUser.email)) {
                    setUser(parsedUser);
                } else {
                    // Stored user object is corrupted or incomplete
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            } catch (err) {
                console.error('Failed to parse stored user:', err);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await authService.login({ email, password });
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        return await authService.register(userData);
    };

    const verifyOtp = async (email, otp) => {
        return await authService.verifyOtp({ email, otp });
    }

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOtp, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
