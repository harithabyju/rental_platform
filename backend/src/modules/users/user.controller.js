const userService = require('./user.service');

const register = async (req, res) => {
    try {
        const user = await userService.register(req.body);

        // Remove sensitive data
        const { password, otp, ...userWithoutSensitiveData } = user;

        res.status(201).json({ message: 'User registered. Please verify OTP sent to email.', user: userWithoutSensitiveData });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        await userService.verifyOtp(email, otp);
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await userService.login(email, password);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await userService.getUserProfile(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMe = async (req, res) => {
    try {
        const user = await userService.updateUserProfile(req.user.id, req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const blockUser = async (req, res) => {
    try {
        const { userId } = req.body;
        await userService.blockUser(userId);
        res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const unblockUser = async (req, res) => {
    try {
        const { userId } = req.body;
        await userService.unblockUser(userId);
        res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getShopsAnalytics = async (req, res) => {
    try {
        const shops = await userService.getShopsAnalytics();
        res.status(200).json({ success: true, data: shops });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    register,
    verifyOtp,
    login,
    getMe,
    updateMe,
    getAllUsers,
    blockUser,
    unblockUser,
    getShopsAnalytics
};
