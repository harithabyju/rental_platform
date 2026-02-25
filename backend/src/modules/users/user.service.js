const userRepository = require('./user.repository');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');
const { sendEmail, generateOTP } = require('../../utils/email');

const register = async (userData) => {
    let { fullname, email, password, role } = userData;
    email = email.toLowerCase();

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
        if (!existingUser.verified) {
            // Allow unverified users to re-register/resend OTP
            const otp = generateOTP();
            const hashedPassword = await hashPassword(password);
            await userRepository.updateUserOtp(email, otp, hashedPassword);
            await sendEmail(email, 'Verify your email', `Your OTP is ${otp}`);
            return { ...existingUser, otp };
        }
        throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();

    const newUser = await userRepository.createUser({
        fullname,
        email,
        password: hashedPassword,
        role: role || 'customer',
        otp,
    });

    await sendEmail(email, 'Verify your email', `Your OTP is ${otp}`);

    return newUser;
};

const verifyOtp = async (email, otp) => {
    email = email.toLowerCase();
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    if (user.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    return await userRepository.verifyUser(email);
};

const login = async (email, password) => {
    email = email.toLowerCase();
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
        throw new Error('Invalid credentials');
    }

    if (user.blocked) {
        throw new Error('User is blocked');
    }

    if (!user.verified) {
        throw new Error('Please verify your email first');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id, user.role);
    return { user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role, latitude: user.latitude, longitude: user.longitude, created_at: user.created_at }, token };
};

const getUserProfile = async (id) => {
    return await userRepository.findUserById(id);
};

const updateUserProfile = async (id, data) => {
    return await userRepository.updateUserProfile(id, data);
}

const getAllUsers = async () => {
    return await userRepository.getAllUsers();
}

const blockUser = async (id) => {
    return await userRepository.blockUser(id);
}

const unblockUser = async (id) => {
    return await userRepository.unblockUser(id);
}

const getShopsAnalytics = async () => {
    return await userRepository.getShopsAnalytics();
}

module.exports = {
    register,
    verifyOtp,
    login,
    getUserProfile,
    getAllUsers,
    updateUserProfile,
    blockUser,
    unblockUser,
    getShopsAnalytics
};
