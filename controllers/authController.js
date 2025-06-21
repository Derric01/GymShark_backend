const User = require('../models/User');
const { generateToken } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorHandler');
const { getHealthInsights } = require('../utils/bmiCalculator');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, age, gender, height, weight, goal } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Validate required fields
  if (!name || !email || !password || !age || !gender || !height || !weight || !goal) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    age: parseInt(age),
    gender,
    height: parseFloat(height),
    weight: parseFloat(weight),
    goal
  });

  // Generate token
  const token = generateToken(user._id);

  // Get health insights
  const healthInsights = getHealthInsights(user.toJSON());

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      token,
      healthInsights
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token
    }
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Get health insights
  const healthInsights = getHealthInsights(user.toJSON());

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      healthInsights
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'age', 'height', 'weight', 'goal'];
  const updates = {};
  
  // Filter allowed updates
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  // Update user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { 
      new: true, 
      runValidators: true 
    }
  );

  // Get updated health insights
  const healthInsights = getHealthInsights(user.toJSON());

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON(),
      healthInsights
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters'
    });
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/me
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required to delete account'
    });
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password'
    });
  }

  // Delete related data
  await Promise.all([
    require('../models/WorkoutPlan').deleteMany({ userId: user._id }),
    require('../models/Progress').deleteMany({ userId: user._id }),
    require('../models/Membership').deleteMany({ userId: user._id })
  ]);

  // Delete user
  await User.findByIdAndDelete(user._id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount
};
