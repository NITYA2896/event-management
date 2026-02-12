const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, clubId } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        clubId: role === 'clubAdmin' ? clubId : null
    });

    if (user) {
        generateToken(res, user._id, user.role);
        // We also need to generate a token string to send back if we want to support headers
        // But generateToken only sets cookie. Let's modify it or just sign it here again?
        // Better: Update generateToken to return the token string.
        const token = require('jsonwebtoken').sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            clubId: user.clubId,
            token // Send token for fallback
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id, user.role);

        const token = require('jsonwebtoken').sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            clubId: user.clubId,
            token // Send token for fallback
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};
