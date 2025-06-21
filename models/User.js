const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [13, 'Age must be at least 13'],
    max: [100, 'Age cannot exceed 100']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  height: {
    type: Number,
    required: [true, 'Height is required (in cm)'],
    min: [100, 'Height must be at least 100cm'],
    max: [250, 'Height cannot exceed 250cm']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required (in kg)'],
    min: [30, 'Weight must be at least 30kg'],
    max: [300, 'Weight cannot exceed 300kg']
  },
  goal: {
    type: String,
    required: [true, 'Fitness goal is required'],
    enum: ['weight loss', 'muscle gain', 'maintenance']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate BMI method
userSchema.methods.calculateBMI = function() {
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
