const WorkoutPlan = require('../models/WorkoutPlan');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get all workout plans for user
 * @route   GET /api/workouts
 * @access  Private
 */
const getWorkoutPlans = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty, targetMuscle, isActive } = req.query;

  // Build filter
  const filter = { userId: req.user._id };
  
  if (difficulty) filter.difficulty = difficulty;
  if (targetMuscle) filter.targetMuscleGroups = { $in: [targetMuscle] };
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Get workouts with pagination
  const workouts = await WorkoutPlan.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await WorkoutPlan.countDocuments(filter);

  res.json({
    success: true,
    count: workouts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      workouts: workouts.map(workout => ({
        id: workout._id,
        title: workout.title,
        description: workout.description,
        difficulty: workout.difficulty,
        targetMuscleGroups: workout.targetMuscleGroups,
        estimatedDuration: workout.estimatedDuration,
        exerciseCount: workout.exercises.length,
        isActive: workout.isActive,
        createdAt: workout.createdAt,
        summary: workout.getSummary()
      }))
    }
  });
});

/**
 * @desc    Get single workout plan
 * @route   GET /api/workouts/:id
 * @access  Private
 */
const getWorkoutPlan = asyncHandler(async (req, res) => {
  const workout = await WorkoutPlan.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout plan not found'
    });
  }

  res.json({
    success: true,
    data: {
      workout: {
        id: workout._id,
        title: workout.title,
        description: workout.description,
        exercises: workout.exercises,
        difficulty: workout.difficulty,
        estimatedDuration: workout.estimatedDuration,
        targetMuscleGroups: workout.targetMuscleGroups,
        isActive: workout.isActive,
        createdAt: workout.createdAt,
        updatedAt: workout.updatedAt,
        summary: workout.getSummary()
      }
    }
  });
});

/**
 * @desc    Create new workout plan
 * @route   POST /api/workouts
 * @access  Private
 */
const createWorkoutPlan = asyncHandler(async (req, res) => {
  const { title, description, exercises, difficulty, targetMuscleGroups } = req.body;

  // Validation
  if (!title || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Title and at least one exercise are required'
    });
  }

  // Validate exercises
  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    if (!exercise.name || !exercise.sets || !exercise.reps) {
      return res.status(400).json({
        success: false,
        message: `Exercise ${i + 1}: name, sets, and reps are required`
      });
    }
  }

  const workout = await WorkoutPlan.create({
    userId: req.user._id,
    title: title.trim(),
    description: description?.trim(),
    exercises,
    difficulty: difficulty || 'Beginner',
    targetMuscleGroups: targetMuscleGroups || []
  });

  res.status(201).json({
    success: true,
    message: 'Workout plan created successfully',
    data: {
      workout: {
        id: workout._id,
        title: workout.title,
        description: workout.description,
        exercises: workout.exercises,
        difficulty: workout.difficulty,
        estimatedDuration: workout.estimatedDuration,
        targetMuscleGroups: workout.targetMuscleGroups,
        isActive: workout.isActive,
        summary: workout.getSummary()
      }
    }
  });
});

/**
 * @desc    Update workout plan
 * @route   PUT /api/workouts/:id
 * @access  Private
 */
const updateWorkoutPlan = asyncHandler(async (req, res) => {
  const { title, description, exercises, difficulty, targetMuscleGroups, isActive } = req.body;

  const workout = await WorkoutPlan.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout plan not found'
    });
  }

  // Update fields
  if (title) workout.title = title.trim();
  if (description !== undefined) workout.description = description?.trim();
  if (exercises && Array.isArray(exercises)) {
    // Validate exercises
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      if (!exercise.name || !exercise.sets || !exercise.reps) {
        return res.status(400).json({
          success: false,
          message: `Exercise ${i + 1}: name, sets, and reps are required`
        });
      }
    }
    workout.exercises = exercises;
  }
  if (difficulty) workout.difficulty = difficulty;
  if (targetMuscleGroups) workout.targetMuscleGroups = targetMuscleGroups;
  if (isActive !== undefined) workout.isActive = isActive;

  await workout.save();

  res.json({
    success: true,
    message: 'Workout plan updated successfully',
    data: {
      workout: {
        id: workout._id,
        title: workout.title,
        description: workout.description,
        exercises: workout.exercises,
        difficulty: workout.difficulty,
        estimatedDuration: workout.estimatedDuration,
        targetMuscleGroups: workout.targetMuscleGroups,
        isActive: workout.isActive,
        updatedAt: workout.updatedAt,
        summary: workout.getSummary()
      }
    }
  });
});

/**
 * @desc    Delete workout plan
 * @route   DELETE /api/workouts/:id
 * @access  Private
 */
const deleteWorkoutPlan = asyncHandler(async (req, res) => {
  const workout = await WorkoutPlan.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout plan not found'
    });
  }

  await WorkoutPlan.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Workout plan deleted successfully'
  });
});

/**
 * @desc    Duplicate workout plan
 * @route   POST /api/workouts/:id/duplicate
 * @access  Private
 */
const duplicateWorkoutPlan = asyncHandler(async (req, res) => {
  const originalWorkout = await WorkoutPlan.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!originalWorkout) {
    return res.status(404).json({
      success: false,
      message: 'Workout plan not found'
    });
  }

  const duplicatedWorkout = await WorkoutPlan.create({
    userId: req.user._id,
    title: `${originalWorkout.title} (Copy)`,
    description: originalWorkout.description,
    exercises: originalWorkout.exercises,
    difficulty: originalWorkout.difficulty,
    targetMuscleGroups: originalWorkout.targetMuscleGroups
  });

  res.status(201).json({
    success: true,
    message: 'Workout plan duplicated successfully',
    data: {
      workout: {
        id: duplicatedWorkout._id,
        title: duplicatedWorkout.title,
        description: duplicatedWorkout.description,
        exercises: duplicatedWorkout.exercises,
        difficulty: duplicatedWorkout.difficulty,
        estimatedDuration: duplicatedWorkout.estimatedDuration,
        targetMuscleGroups: duplicatedWorkout.targetMuscleGroups,
        summary: duplicatedWorkout.getSummary()
      }
    }
  });
});

/**
 * @desc    Get workout statistics
 * @route   GET /api/workouts/stats
 * @access  Private
 */
const getWorkoutStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Aggregate statistics
  const stats = await WorkoutPlan.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        activeWorkouts: { $sum: { $cond: ['$isActive', 1, 0] } },
        totalExercises: { $sum: { $size: '$exercises' } },
        avgDuration: { $avg: '$estimatedDuration' },
        difficultyBreakdown: {
          $push: '$difficulty'
        },
        muscleGroupBreakdown: {
          $push: '$targetMuscleGroups'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return res.json({
      success: true,
      data: {
        stats: {
          totalWorkouts: 0,
          activeWorkouts: 0,
          totalExercises: 0,
          avgDuration: 0,
          difficultyBreakdown: {},
          muscleGroupBreakdown: {}
        }
      }
    });
  }

  const result = stats[0];

  // Process difficulty breakdown
  const difficultyCount = {};
  result.difficultyBreakdown.forEach(difficulty => {
    difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
  });

  // Process muscle group breakdown
  const muscleGroupCount = {};
  result.muscleGroupBreakdown.forEach(groups => {
    groups.forEach(group => {
      muscleGroupCount[group] = (muscleGroupCount[group] || 0) + 1;
    });
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalWorkouts: result.totalWorkouts,
        activeWorkouts: result.activeWorkouts,
        totalExercises: result.totalExercises,
        avgDuration: Math.round(result.avgDuration),
        difficultyBreakdown: difficultyCount,
        muscleGroupBreakdown: muscleGroupCount
      }
    }
  });
});

module.exports = {
  getWorkoutPlans,
  getWorkoutPlan,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  duplicateWorkoutPlan,
  getWorkoutStats
};
