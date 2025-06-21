const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  sets: {
    type: Number,
    required: [true, 'Number of sets is required'],
    min: [1, 'Sets must be at least 1'],
    max: [10, 'Sets cannot exceed 10']
  },
  reps: {
    type: Number,
    required: [true, 'Number of reps is required'],
    min: [1, 'Reps must be at least 1'],
    max: [100, 'Reps cannot exceed 100']
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute'],
    max: [120, 'Duration cannot exceed 120 minutes']
  },
  restTime: {
    type: Number,
    default: 60,
    min: [15, 'Rest time must be at least 15 seconds'],
    max: [300, 'Rest time cannot exceed 5 minutes']
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
});

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Workout title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  exercises: {
    type: [exerciseSchema],
    validate: {
      validator: function(exercises) {
        return exercises && exercises.length > 0;
      },
      message: 'At least one exercise is required'
    }
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: [15, 'Workout must be at least 15 minutes'],
    max: [180, 'Workout cannot exceed 3 hours']
  },
  targetMuscleGroups: [{
    type: String,
    enum: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
workoutPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total estimated duration based on exercises
workoutPlanSchema.pre('save', function(next) {
  if (this.exercises && this.exercises.length > 0) {
    let totalDuration = 0;
    this.exercises.forEach(exercise => {
      // Estimate: (sets * reps * 3 seconds) + (sets * rest time) + exercise duration
      const exerciseTime = (exercise.sets * exercise.reps * 3) / 60; // convert to minutes
      const restTime = (exercise.sets * exercise.restTime) / 60; // convert to minutes
      const duration = exercise.duration || 0;
      totalDuration += exerciseTime + restTime + duration;
    });
    this.estimatedDuration = Math.ceil(totalDuration);
  }
  next();
});

// Instance method to get workout summary
workoutPlanSchema.methods.getSummary = function() {
  return {
    totalExercises: this.exercises.length,
    estimatedDuration: this.estimatedDuration,
    difficulty: this.difficulty,
    targetMuscleGroups: this.targetMuscleGroups
  };
};

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
