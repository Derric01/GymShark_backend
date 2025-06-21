const mongoose = require('mongoose');

const homeWorkoutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Bodyweight', 'HIIT', 'Yoga', 'Pilates', 'Cardio', 'Strength', 'Flexibility', 'Core']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 5,
    max: 120
  },
  equipment: [{
    type: String,
    enum: ['None', 'Yoga Mat', 'Resistance Bands', 'Dumbbells', 'Kettlebell', 'Jump Rope', 'Pull-up Bar', 'Stability Ball']
  }],  targetMuscleGroups: [{
    type: String,
    enum: ['Full Body', 'Upper Body', 'Lower Body', 'Core', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Abs', 'Flexibility', 'Cardio']
  }],
  exercises: [{
    name: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      required: true
    },
    sets: {
      type: Number,
      min: 1,
      max: 10
    },
    reps: {
      type: String, // Can be "10-15" or "30 seconds" for time-based
      required: true
    },
    restTime: {
      type: Number, // in seconds
      default: 30
    },
    modifications: {
      beginner: String,
      advanced: String
    },
    tips: [String]
  }],
  warmUp: [{
    name: String,
    duration: String,
    instructions: String
  }],
  coolDown: [{
    name: String,
    duration: String,
    instructions: String
  }],
  calories: {
    type: Number, // estimated calories burned
    min: 50,
    max: 800
  },
  tags: [String],
  isPopular: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get workouts by category
homeWorkoutSchema.statics.getByCategory = function(category) {
  return this.find({ category }).sort({ difficulty: 1, duration: 1 });
};

// Static method to get workouts by difficulty
homeWorkoutSchema.statics.getByDifficulty = function(difficulty) {
  return this.find({ difficulty }).sort({ category: 1, duration: 1 });
};

// Static method to get workouts by duration range
homeWorkoutSchema.statics.getByDuration = function(minDuration, maxDuration) {
  return this.find({ 
    duration: { $gte: minDuration, $lte: maxDuration } 
  }).sort({ duration: 1 });
};

// Instance method to get workout summary
homeWorkoutSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    title: this.title,
    category: this.category,
    difficulty: this.difficulty,
    duration: this.duration,
    exerciseCount: this.exercises.length,
    equipment: this.equipment,
    targetMuscles: this.targetMuscleGroups,
    estimatedCalories: this.calories
  };
};

module.exports = mongoose.model('HomeWorkout', homeWorkoutSchema);
