const express = require('express');
const router = express.Router();
const {
  createMembership,
  getCurrentMembership,
  getMembershipHistory,
  getAvailablePlans,
  cancelMembership,
  renewMembership
} = require('../controllers/membershipController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// @route   GET /api/membership/plans
// @desc    Get available membership plans
// @access  Public
router.get('/plans', getAvailablePlans);

// @route   POST /api/membership
// @desc    Create new membership
// @access  Private
router.post('/', authMiddleware, createMembership);

// @route   GET /api/membership/me
// @desc    Get current user membership
// @access  Private
router.get('/me', authMiddleware, getCurrentMembership);

// @route   GET /api/membership/history
// @desc    Get membership history
// @access  Private
router.get('/history', authMiddleware, getMembershipHistory);

// @route   PUT /api/membership/cancel
// @desc    Cancel current membership
// @access  Private
router.put('/cancel', authMiddleware, cancelMembership);

// @route   POST /api/membership/renew
// @desc    Renew or upgrade membership
// @access  Private
router.post('/renew', authMiddleware, renewMembership);

module.exports = router;
