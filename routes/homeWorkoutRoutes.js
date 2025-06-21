const express = require('express');
const router = express.Router();
const {
  getHomeWorkouts,
  getHomeWorkout,
  getWorkoutsByCategory,
  getWorkoutsByDifficulty,
  getWorkoutsByDuration,
  getFeaturedWorkouts,
  getPersonalizedRecommendations,
  getWorkoutFilters
} = require('../controllers/homeWorkoutController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');

// @route   GET /api/home-workouts
// @desc    Get all home workouts with filtering and pagination
// @access  Public
router.get('/', getHomeWorkouts);

// @route   GET /api/home-workouts/filters
// @desc    Get workout categories and filter options
// @access  Public
router.get('/filters', getWorkoutFilters);

// @route   GET /api/home-workouts/featured
// @desc    Get popular/featured workouts
// @access  Public
router.get('/featured', getFeaturedWorkouts);

// @route   GET /api/home-workouts/recommendations
// @desc    Get personalized workout recommendations
// @access  Private
router.get('/recommendations', authMiddleware, getPersonalizedRecommendations);

// @route   GET /api/home-workouts/category/:category
// @desc    Get workouts by category
// @access  Public
router.get('/category/:category', getWorkoutsByCategory);

// @route   GET /api/home-workouts/difficulty/:difficulty
// @desc    Get workouts by difficulty level
// @access  Public
router.get('/difficulty/:difficulty', getWorkoutsByDifficulty);

// @route   GET /api/home-workouts/duration/:range
// @desc    Get workouts by duration range (quick, moderate, long, extended)
// @access  Public
router.get('/duration/:range', getWorkoutsByDuration);

// @route   GET /api/home-workouts/:id
// @desc    Get single home workout with full details
// @access  Public
router.get('/:id', getHomeWorkout);

module.exports = router;
