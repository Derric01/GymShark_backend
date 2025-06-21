const mongoose = require('mongoose');

const supplementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Protein', 'Pre-Workout', 'Post-Workout', 'Vitamins', 'Minerals', 'Amino Acids', 'Fat Burners', 'Mass Gainers', 'Recovery', 'General Health']
  },
  description: {
    type: String,
    required: true
  },
  benefits: [{
    type: String,
    required: true
  }],
  recommendedFor: [{
    type: String,
    enum: ['weight loss', 'muscle gain', 'maintenance', 'endurance', 'recovery', 'general health']
  }],
  dosage: {
    amount: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    timing: {
      type: String,
      required: true
    },
    instructions: String
  },
  ingredients: [{
    name: String,
    amount: String,
    purpose: String
  }],
  sideEffects: [String],
  contraindications: [String],
  interactions: [String],
  targetGender: {
    type: String,
    enum: ['All', 'Male', 'Female'],
    default: 'All'
  },
  ageRange: {
    min: {
      type: Number,
      default: 18
    },
    max: {
      type: Number,
      default: 65
    }
  },
  price: {
    range: String,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  effectiveness: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    evidenceLevel: {
      type: String,
      enum: ['High', 'Moderate', 'Limited', 'Insufficient'],
      default: 'Moderate'
    }
  },
  tags: [String],
  isEssential: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get supplements by category
supplementSchema.statics.getByCategory = function(category) {
  return this.find({ category }).sort({ effectiveness: -1, name: 1 });
};

// Static method to get supplements by goal
supplementSchema.statics.getByGoal = function(goal) {
  return this.find({ recommendedFor: { $in: [goal] } }).sort({ effectiveness: -1 });
};

// Static method to get essential supplements
supplementSchema.statics.getEssentials = function() {
  return this.find({ isEssential: true }).sort({ category: 1 });
};

// Instance method to check if suitable for user
supplementSchema.methods.isSuitableFor = function(userProfile) {
  const { age, gender, goal } = userProfile;
  
  // Check age range
  if (age < this.ageRange.min || age > this.ageRange.max) {
    return { suitable: false, reason: 'Age not in recommended range' };
  }
  
  // Check gender
  if (this.targetGender !== 'All' && this.targetGender.toLowerCase() !== gender.toLowerCase()) {
    return { suitable: false, reason: 'Not recommended for your gender' };
  }
  
  // Check goal compatibility
  if (this.recommendedFor.length > 0 && !this.recommendedFor.includes(goal)) {
    return { suitable: false, reason: 'Not aligned with your fitness goal' };
  }
  
  return { suitable: true, reason: 'Compatible with your profile' };
};

// Instance method to get personalized recommendation
supplementSchema.methods.getPersonalizedRecommendation = function(userProfile) {
  const suitability = this.isSuitableFor(userProfile);
  
  return {
    supplement: {
      name: this.name,
      category: this.category,
      description: this.description,
      benefits: this.benefits
    },
    suitability,
    dosage: this.dosage,
    importance: this.isEssential ? 'Essential' : this.isPopular ? 'Popular' : 'Optional',
    effectiveness: this.effectiveness
  };
};

module.exports = mongoose.model('Supplement', supplementSchema);
