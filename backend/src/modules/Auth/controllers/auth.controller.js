
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../../User/User');

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = user.generateAuthToken();
    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        secure: process.env.NODE_ENV === 'production',
    };

    return res.status(statusCode).cookie('token', token, options).json({ success: true, data: { user, token }, message });
};

/**
 * @desc    Register a new organization and its owner
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    // #swagger.tags = ['Auth']
    console.log("req.body: ", req.body)
    const { name, email, password, role, seniority, skills, maxCapacity } = req.body;

    if (!name || !email || !password || !role || !seniority) {
        return res.status(400).json({
            success: false,
            message: "Please provide user name, email, role, seniority, and password"
        });
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const user = await User.create([{
            name,
            email,
            password,
            role,
            seniority, 
            skills, 
            maxCapacity
        }], { session });

        await session.commitTransaction();

        sendTokenResponse(user[0], 201, res, "User registered successfully");

    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        if (error.code === 11000) return res.status(409).json({ success: false, message: `User with email '${email}' already exists.` })
        next(error);
    } finally {
        session.endSession();
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    // #swagger.tags = ['Auth']
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' })
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.isPasswordCorrect(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        sendTokenResponse(user, 200, res, "Login successful");
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Protected
 */
const logout = (req, res, next) => {
    // #swagger.tags = ['Auth']
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
};


/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
    // #swagger.tags = ['Auth']
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            // NOTE: We don't want to reveal if a user exists or not for security reasons.
            // We always send a success response to prevent email enumeration attacks.
            return res.status(200).json(new ApiResponse(200, null, "If a user with that email exists, a password reset link has been sent."));
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PATCH request to: \n\n ${resetUrl}`;

        // try {
        //     await sendEmail({ email: user.email, subject: 'Password Reset Token', message });
        //     res.status(200).json(new ApiResponse(200, null, "Password reset link has been sent to your email."));
        // } catch (err) {
        console.log(`RESET TOKEN (for testing): ${resetToken}`); // For development/testing
        console.log(`RESET URL (for testing): ${resetUrl}`);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ApiError(500, "Email could not be sent. Please try again later."));
        // }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password
 * @route   PATCH /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
    // #swagger.tags = ['Auth']
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return next(new ApiError(400, 'Token is invalid or has expired'));
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        sendTokenResponse(user, 200, res, "Password has been reset successfully.");

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
}