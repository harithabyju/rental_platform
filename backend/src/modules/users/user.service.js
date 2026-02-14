const userRepository = require('./user.repository');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');
const { sendEmail, generateOTP } = require('../../utils/email');

const register = async (userData) => {
    const { fullname, email, password, role } = userData;

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
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
    return { user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role }, token };
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

module.exports = {
    register,
    verifyOtp,
    login,
    getUserProfile,
    getAllUsers,
    updateUserProfile,
    blockUser
};
