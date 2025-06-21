const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true
  },
  calories: {
    type: Number,
    required: [true, 'Calories are required'],
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    required: [true, 'Protein content is required'],
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    required: [true, 'Carbohydrate content is required'],
    min: [0, 'Carbohydrates cannot be negative']
  },
  fat: {
    type: Number,
    required: [true, 'Fat content is required'],
    min: [0, 'Fat cannot be negative']
  },
  quantity: {
    type: String,
    default: '1 serving'
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
});

const mealSchema = new mongoose.Schema({  time: {
    type: String,
    required: [true, 'Meal time is required'],
    enum: ['Breakfast', 'Mid-Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack', 'Pre-Workout Snack', 'Post-Workout', 'Post-Workout Snack', 'Late Night Snack']
  },
  items: {
    type: [foodItemSchema],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one food item is required per meal'
    }
  }
});

const dietPlanSchema = new mongoose.Schema({
  goal: {
    type: String,
    required: [true, 'Diet goal is required'],
    enum: ['weight loss', 'muscle gain', 'maintenance'],
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Diet plan title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Diet plan description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  meals: {
    type: [mealSchema],
    validate: {
      validator: function(meals) {
        return meals && meals.length >= 3; // At least breakfast, lunch, dinner
      },
      message: 'At least 3 meals are required (breakfast, lunch, dinner)'
    }
  },
  totalCalories: {
    type: Number,
    min: [1000, 'Total calories must be at least 1000'],
    max: [5000, 'Total calories cannot exceed 5000']
  },
  totalProtein: {
    type: Number,
    min: [0, 'Total protein cannot be negative']
  },
  totalCarbs: {
    type: Number,
    min: [0, 'Total carbs cannot be negative']
  },
  totalFat: {
    type: Number,
    min: [0, 'Total fat cannot be negative']
  },
  guidelines: [{
    type: String,
    maxlength: [300, 'Each guideline cannot exceed 300 characters']
  }],
  restrictions: [{
    type: String,
    maxlength: [200, 'Each restriction cannot exceed 200 characters']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total nutrition before saving
dietPlanSchema.pre('save', function(next) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  this.meals.forEach(meal => {
    meal.items.forEach(item => {
      totalCalories += item.calories || 0;
      totalProtein += item.protein || 0;
      totalCarbs += item.carbs || 0;
      totalFat += item.fat || 0;
    });
  });

  this.totalCalories = totalCalories;
  this.totalProtein = totalProtein;
  this.totalCarbs = totalCarbs;
  this.totalFat = totalFat;

  next();
});

// Instance method to get nutrition summary
dietPlanSchema.methods.getNutritionSummary = function() {
  return {
    calories: this.totalCalories,
    protein: this.totalProtein,
    carbs: this.totalCarbs,
    fat: this.totalFat,
    proteinPercentage: Math.round((this.totalProtein * 4 / this.totalCalories) * 100),
    carbsPercentage: Math.round((this.totalCarbs * 4 / this.totalCalories) * 100),
    fatPercentage: Math.round((this.totalFat * 9 / this.totalCalories) * 100)
  };
};

// Static method to get all available goals
dietPlanSchema.statics.getAvailableGoals = function() {
  return ['weight loss', 'muscle gain', 'maintenance'];
};

module.exports = mongoose.model('DietPlan', dietPlanSchema);
