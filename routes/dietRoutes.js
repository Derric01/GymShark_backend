const express = require('express');
const router = express.Router();
const {
  getDietGoals,
  getDietPlanByGoal,
  getDietRecommendations,
  getMealSuggestions,
  searchFoodItems
} = require('../controllers/dietController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');

// @route   GET /api/diets
// @desc    Get all available diet goals and plans overview
// @access  Public
router.get('/', getDietGoals);

// @route   GET /api/diets/search
// @desc    Search food items across all diet plans
// @access  Public
router.get('/search', searchFoodItems);

// @route   GET /api/diets/recommendations
// @desc    Get personalized diet recommendations
// @access  Private
router.get('/recommendations', authMiddleware, getDietRecommendations);

// @route   GET /api/diets/meals/:mealTime
// @desc    Get meal suggestions for specific time
// @access  Public
router.get('/meals/:mealTime', getMealSuggestions);

// @route   GET /api/diets/:goal
// @desc    Get diet plan by goal
// @access  Public
router.get('/:goal', getDietPlanByGoal);

module.exports = router;
