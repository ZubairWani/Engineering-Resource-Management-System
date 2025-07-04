const express = require('express');
const {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
} = require('../controllers/auth.controller.js');
const { Authenticate } = require('../../../middlewares/auth.middleware.js');

const router = express.Router();

// --- Public Routes ---
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// --- Protected Route ---
router.post('/logout', Authenticate, logout);

module.exports = router;