const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount
} = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, getMe);

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', authMiddleware, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authMiddleware, changePassword);

// @route   DELETE /api/auth/me
// @desc    Delete user account
// @access  Private
router.delete('/me', authMiddleware, deleteAccount);

module.exports = router;
