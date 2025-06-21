const express = require('express');
const router = express.Router();
const {
  logProgress,
  getProgressHistory,
  getProgressSummary,
  updateProgressEntry,
  deleteProgressEntry,
  getChartsData
} = require('../controllers/progressController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// @route   POST /api/progress
// @desc    Log new progress entry
// @access  Private
router.post('/', authMiddleware, logProgress);

// @route   GET /api/progress
// @desc    Get user progress history with filtering and pagination
// @access  Private
router.get('/', authMiddleware, getProgressHistory);

// @route   GET /api/progress/summary
// @desc    Get progress summary and analytics
// @access  Private
router.get('/summary', authMiddleware, getProgressSummary);

// @route   GET /api/progress/charts
// @desc    Get progress data formatted for charts
// @access  Private
router.get('/charts', authMiddleware, getChartsData);

// @route   PUT /api/progress/:id
// @desc    Update progress entry
// @access  Private
router.put('/:id', authMiddleware, updateProgressEntry);

// @route   DELETE /api/progress/:id
// @desc    Delete progress entry
// @access  Private
router.delete('/:id', authMiddleware, deleteProgressEntry);

module.exports = router;
