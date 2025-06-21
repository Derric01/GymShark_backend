const express = require('express');
const router = express.Router();
const {
  getSupplements,
  getSupplement,
  getSupplementsByCategory,
  getSupplementsByGoal,
  getEssentialSupplements,
  getPersonalizedRecommendations,
  getSupplementFilters,
  checkSupplementInteractions
} = require('../controllers/supplementController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// @route   GET /api/supplements
// @desc    Get all supplements with filtering and search
// @access  Public
router.get('/', getSupplements);

// @route   GET /api/supplements/filters
// @desc    Get supplement categories and filter options
// @access  Public
router.get('/filters', getSupplementFilters);

// @route   GET /api/supplements/essential
// @desc    Get essential supplements
// @access  Public
router.get('/essential', getEssentialSupplements);

// @route   GET /api/supplements/recommendations
// @desc    Get personalized supplement recommendations
// @access  Private
router.get('/recommendations', authMiddleware, getPersonalizedRecommendations);

// @route   POST /api/supplements/interactions
// @desc    Check supplement interactions
// @access  Public
router.post('/interactions', checkSupplementInteractions);

// @route   GET /api/supplements/category/:category
// @desc    Get supplements by category
// @access  Public
router.get('/category/:category', getSupplementsByCategory);

// @route   GET /api/supplements/goal/:goal
// @desc    Get supplements by fitness goal
// @access  Public
router.get('/goal/:goal', getSupplementsByGoal);

// @route   GET /api/supplements/:id
// @desc    Get single supplement with full details
// @access  Public
router.get('/:id', getSupplement);

module.exports = router;
