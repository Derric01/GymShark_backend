const HomeWorkout = require('../models/HomeWorkout');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get all home workouts with filtering
 * @route   GET /api/home-workouts
 * @access  Public
 */
const getHomeWorkouts = asyncHandler(async (req, res) => {
  const { 
    category, 
    difficulty, 
    duration, 
    equipment, 
    targetMuscle,
    page = 1, 
    limit = 20 
  } = req.query;

  // Build filter
  const filter = {};
  
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (equipment) filter.equipment = { $in: [equipment] };
  if (targetMuscle) filter.targetMuscleGroups = { $in: [targetMuscle] };
  
  // Duration filtering
  if (duration) {
    const [min, max] = duration.split('-').map(Number);
    if (max) {
      filter.duration = { $gte: min, $lte: max };
    } else {
      filter.duration = { $gte: min };
    }
  }

  const workouts = await HomeWorkout.find(filter)
    .sort({ isPopular: -1, difficulty: 1, duration: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-exercises.instructions -warmUp -coolDown'); // Exclude detailed instructions for list view

  const total = await HomeWorkout.countDocuments(filter);

  res.json({
    success: true,
    count: workouts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      workouts: workouts.map(workout => workout.getSummary())
    }
  });
});

/**
 * @desc    Get single home workout with full details
 * @route   GET /api/home-workouts/:id
 * @access  Public
 */
const getHomeWorkout = asyncHandler(async (req, res) => {
  const workout = await HomeWorkout.findById(req.params.id);

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Home workout not found'
    });
  }

  res.json({
    success: true,
    data: {
      workout: {
        id: workout._id,
        title: workout.title,
        description: workout.description,
        category: workout.category,
        difficulty: workout.difficulty,
        duration: workout.duration,
        equipment: workout.equipment,
        targetMuscleGroups: workout.targetMuscleGroups,
        exercises: workout.exercises,
        warmUp: workout.warmUp,
        coolDown: workout.coolDown,
        calories: workout.calories,
        tags: workout.tags,
        summary: workout.getSummary()
      }
    }
  });
});

/**
 * @desc    Get workouts by category
 * @route   GET /api/home-workouts/category/:category
 * @access  Public
 */
const getWorkoutsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 10 } = req.query;

  const workouts = await HomeWorkout.getByCategory(category).limit(parseInt(limit));

  res.json({
    success: true,
    count: workouts.length,
    data: {
      category,
      workouts: workouts.map(workout => workout.getSummary())
    }
  });
});

/**
 * @desc    Get workouts by difficulty
 * @route   GET /api/home-workouts/difficulty/:difficulty
 * @access  Public
 */
const getWorkoutsByDifficulty = asyncHandler(async (req, res) => {
  const { difficulty } = req.params;
  const { limit = 10 } = req.query;

  const workouts = await HomeWorkout.getByDifficulty(difficulty).limit(parseInt(limit));

  res.json({
    success: true,
    count: workouts.length,
    data: {
      difficulty,
      workouts: workouts.map(workout => workout.getSummary())
    }
  });
});

/**
 * @desc    Get workouts by duration range
 * @route   GET /api/home-workouts/duration/:range
 * @access  Public
 */
const getWorkoutsByDuration = asyncHandler(async (req, res) => {
  const { range } = req.params;
  const { limit = 10 } = req.query;

  let minDuration, maxDuration;

  switch (range) {
    case 'quick':
      minDuration = 5;
      maxDuration = 15;
      break;
    case 'moderate':
      minDuration = 16;
      maxDuration = 30;
      break;
    case 'long':
      minDuration = 31;
      maxDuration = 60;
      break;
    case 'extended':
      minDuration = 61;
      maxDuration = 120;
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid duration range. Use: quick, moderate, long, or extended'
      });
  }

  const workouts = await HomeWorkout.getByDuration(minDuration, maxDuration).limit(parseInt(limit));

  res.json({
    success: true,
    count: workouts.length,
    data: {
      range,
      duration: `${minDuration}-${maxDuration} minutes`,
      workouts: workouts.map(workout => workout.getSummary())
    }
  });
});

/**
 * @desc    Get popular/featured workouts
 * @route   GET /api/home-workouts/featured
 * @access  Public
 */
const getFeaturedWorkouts = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const workouts = await HomeWorkout.find({ isPopular: true })
    .sort({ difficulty: 1, duration: 1 })
    .limit(parseInt(limit))
    .select('-exercises.instructions -warmUp -coolDown');

  res.json({
    success: true,
    count: workouts.length,
    data: {
      featuredWorkouts: workouts.map(workout => workout.getSummary())
    }
  });
});

/**
 * @desc    Get personalized workout recommendations
 * @route   GET /api/home-workouts/recommendations
 * @access  Private
 */
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const { timeAvailable = 30, equipment = 'None' } = req.query;

  // Build recommendations based on user profile
  const filter = {
    duration: { $lte: parseInt(timeAvailable) },
    equipment: { $in: [equipment, 'None'] }
  };

  // Recommend based on user's goal
  if (user.goal === 'weight loss') {
    filter.category = { $in: ['HIIT', 'Cardio', 'Bodyweight'] };
  } else if (user.goal === 'muscle gain') {
    filter.category = { $in: ['Strength', 'Bodyweight'] };
  } else {
    filter.category = { $in: ['Bodyweight', 'Yoga', 'Pilates', 'Flexibility'] };
  }

  // Recommend difficulty based on experience (simplified logic)
  const recommendedDifficulty = user.age > 50 ? 'Beginner' : 
                               user.age > 35 ? 'Intermediate' : 'Intermediate';

  const workouts = await HomeWorkout.find(filter)
    .sort({ 
      difficulty: recommendedDifficulty === 'Beginner' ? 1 : -1,
      isPopular: -1 
    })
    .limit(8);

  res.json({
    success: true,
    count: workouts.length,
    data: {
      recommendations: workouts.map(workout => ({
        ...workout.getSummary(),
        reasonForRecommendation: getRecommendationReason(workout, user)
      })),
      userProfile: {
        goal: user.goal,
        recommendedDifficulty,
        timeAvailable: parseInt(timeAvailable),
        equipment
      }
    }
  });
});

/**
 * @desc    Get workout categories and filters
 * @route   GET /api/home-workouts/filters
 * @access  Public
 */
const getWorkoutFilters = asyncHandler(async (req, res) => {
  const categories = await HomeWorkout.distinct('category');
  const difficulties = await HomeWorkout.distinct('difficulty');
  const equipment = await HomeWorkout.distinct('equipment');
  const targetMuscles = await HomeWorkout.distinct('targetMuscleGroups');

  // Get workout counts by category
  const categoryCounts = await HomeWorkout.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      filters: {
        categories: categories.sort(),
        difficulties: ['Beginner', 'Intermediate', 'Advanced'],
        equipment: equipment.sort(),
        targetMuscles: targetMuscles.sort(),
        durations: [
          { label: 'Quick (5-15 min)', value: '5-15' },
          { label: 'Moderate (16-30 min)', value: '16-30' },
          { label: 'Long (31-60 min)', value: '31-60' },
          { label: 'Extended (60+ min)', value: '61-120' }
        ]
      },
      statistics: {
        totalWorkouts: await HomeWorkout.countDocuments(),
        popularWorkouts: await HomeWorkout.countDocuments({ isPopular: true }),
        categoryCounts: categoryCounts.reduce((acc, cat) => {
          acc[cat._id] = cat.count;
          return acc;
        }, {})
      }
    }
  });
});

// Helper function to generate recommendation reasons
function getRecommendationReason(workout, user) {
  const reasons = [];

  if (workout.category === 'HIIT' && user.goal === 'weight loss') {
    reasons.push('HIIT is excellent for weight loss');
  }
  
  if (workout.category === 'Strength' && user.goal === 'muscle gain') {
    reasons.push('Strength training supports muscle building');
  }

  if (workout.difficulty === 'Beginner' && user.age > 50) {
    reasons.push('Beginner-friendly for your age group');
  }

  if (workout.equipment.includes('None')) {
    reasons.push('No equipment required');
  }

  if (workout.isPopular) {
    reasons.push('Popular choice among users');
  }

  return reasons.length > 0 ? reasons[0] : 'Matches your preferences';
}

module.exports = {
  getHomeWorkouts,
  getHomeWorkout,
  getWorkoutsByCategory,
  getWorkoutsByDifficulty,
  getWorkoutsByDuration,
  getFeaturedWorkouts,
  getPersonalizedRecommendations,
  getWorkoutFilters
};
