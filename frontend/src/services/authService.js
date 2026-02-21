import api from './api';

const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

const verifyOtp = async (data) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
};

const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const getMe = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
}

const blockUser = async (userId) => {
    const response = await api.patch('/admin/block-user', { userId });
    return response.data;
}

const updateUser = async (userData) => {
    const response = await api.put('/users/me', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const authService = {
    register,
    verifyOtp,
    login,
    logout,
    getMe,
    getAllUsers,
    blockUser,
    updateUser
};

export default authService;
