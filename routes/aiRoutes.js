const express = require('express');
const router = express.Router();
const {
  getFitnessTips,
  getDietAdvice,
  getWorkoutSuggestions,
  getMotivation,
  getPersonalizedInsights
} = require('../controllers/aiController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// @route   POST /api/ai/tips
// @desc    Get AI-powered fitness tips
// @access  Private
router.post('/tips', authMiddleware, getFitnessTips);

// @route   POST /api/ai/diet-advice
// @desc    Get AI diet recommendations
// @access  Private
router.post('/diet-advice', authMiddleware, getDietAdvice);

// @route   POST /api/ai/workout-suggestions
// @desc    Get workout suggestions based on user profile
// @access  Private
router.post('/workout-suggestions', authMiddleware, getWorkoutSuggestions);

// @route   POST /api/ai/motivation
// @desc    Get motivational content and goal-setting advice
// @access  Private
router.post('/motivation', authMiddleware, getMotivation);

// @route   GET /api/ai/insights
// @desc    Analyze user data and provide insights
// @access  Private
router.get('/insights', authMiddleware, getPersonalizedInsights);

module.exports = router;
