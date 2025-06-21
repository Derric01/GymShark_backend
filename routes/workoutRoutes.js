const express = require('express');
const router = express.Router();
const {
  getWorkoutPlans,
  getWorkoutPlan,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  duplicateWorkoutPlan,
  getWorkoutStats
} = require('../controllers/workoutController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// @route   GET /api/workouts
// @desc    Get all workout plans for user (with filtering and pagination)
// @access  Private
router.get('/', authMiddleware, getWorkoutPlans);

// @route   GET /api/workouts/stats
// @desc    Get workout statistics
// @access  Private
router.get('/stats', authMiddleware, getWorkoutStats);

// @route   POST /api/workouts
// @desc    Create new workout plan
// @access  Private
router.post('/', authMiddleware, createWorkoutPlan);

// @route   GET /api/workouts/:id
// @desc    Get single workout plan
// @access  Private
router.get('/:id', authMiddleware, getWorkoutPlan);

// @route   PUT /api/workouts/:id
// @desc    Update workout plan
// @access  Private
router.put('/:id', authMiddleware, updateWorkoutPlan);

// @route   DELETE /api/workouts/:id
// @desc    Delete workout plan
// @access  Private
router.delete('/:id', authMiddleware, deleteWorkoutPlan);

// @route   POST /api/workouts/:id/duplicate
// @desc    Duplicate workout plan
// @access  Private
router.post('/:id/duplicate', authMiddleware, duplicateWorkoutPlan);

module.exports = router;
