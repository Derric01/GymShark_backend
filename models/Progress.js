const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [30, 'Weight must be at least 30kg'],
    max: [300, 'Weight cannot exceed 300kg']
  },
  bmi: {
    type: Number,
    min: [10, 'BMI must be at least 10'],
    max: [50, 'BMI cannot exceed 50']
  },
  bodyFatPercentage: {
    type: Number,
    min: [5, 'Body fat percentage must be at least 5%'],
    max: [50, 'Body fat percentage cannot exceed 50%']
  },
  muscleMass: {
    type: Number,
    min: [20, 'Muscle mass must be at least 20kg'],
    max: [100, 'Muscle mass cannot exceed 100kg']
  },
  measurements: {
    chest: {
      type: Number,
      min: [50, 'Chest measurement must be at least 50cm'],
      max: [200, 'Chest measurement cannot exceed 200cm']
    },
    waist: {
      type: Number,
      min: [50, 'Waist measurement must be at least 50cm'],
      max: [200, 'Waist measurement cannot exceed 200cm']
    },
    hips: {
      type: Number,
      min: [50, 'Hip measurement must be at least 50cm'],
      max: [200, 'Hip measurement cannot exceed 200cm']
    },
    biceps: {
      type: Number,
      min: [20, 'Bicep measurement must be at least 20cm'],
      max: [60, 'Bicep measurement cannot exceed 60cm']
    },
    thighs: {
      type: Number,
      min: [40, 'Thigh measurement must be at least 40cm'],
      max: [100, 'Thigh measurement cannot exceed 100cm']
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  mood: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Poor', 'Terrible'],
    default: 'Average'
  },
  energyLevel: {
    type: Number,
    min: [1, 'Energy level must be at least 1'],
    max: [10, 'Energy level cannot exceed 10'],
    default: 5
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate BMI before saving
progressSchema.pre('save', async function(next) {
  try {
    // Get user's height to calculate BMI
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    
    if (user && user.height) {
      const heightInMeters = user.height / 100;
      this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to get BMI category
progressSchema.methods.getBMICategory = function() {
  const bmi = this.bmi;
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Instance method to calculate weight change from previous entry
progressSchema.methods.getWeightChange = async function() {
  const previousEntry = await mongoose.model('Progress')
    .findOne({
      userId: this.userId,
      date: { $lt: this.date }
    })
    .sort({ date: -1 });

  if (!previousEntry) return null;

  const change = this.weight - previousEntry.weight;
  return {
    amount: parseFloat(change.toFixed(1)),
    percentage: parseFloat(((change / previousEntry.weight) * 100).toFixed(1)),
    trend: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'maintained'
  };
};

// Static method to get user's progress summary
progressSchema.statics.getProgressSummary = async function(userId, days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const entries = await this.find({
    userId,
    date: { $gte: cutoffDate }
  }).sort({ date: 1 });

  if (entries.length === 0) return null;

  const latest = entries[entries.length - 1];
  const earliest = entries[0];

  return {
    totalEntries: entries.length,
    weightChange: {
      amount: parseFloat((latest.weight - earliest.weight).toFixed(1)),
      percentage: parseFloat(((latest.weight - earliest.weight) / earliest.weight * 100).toFixed(1))
    },
    bmiChange: parseFloat((latest.bmi - earliest.bmi).toFixed(1)),
    averageEnergyLevel: parseFloat((entries.reduce((sum, entry) => sum + entry.energyLevel, 0) / entries.length).toFixed(1)),
    period: `${days} days`
  };
};

// Index for efficient querying
progressSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);
