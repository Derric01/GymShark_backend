const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorHandler } = require('./middlewares/errorHandler');
const { generalLimiter, authLimiter, aiLimiter } = require('./middlewares/rateLimiter');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://gym-shark-frontend.vercel.app',
        'https://gym-shark-frontend.vercel.app',
        'https://gym-sharks-frontend.vercel.app'
      ]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use(generalLimiter);

// Routes with specific rate limiting
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/diets', require('./routes/dietRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/ai', aiLimiter, require('./routes/aiRoutes'));
app.use('/api/home-workouts', require('./routes/homeWorkoutRoutes'));
app.use('/api/supplements', require('./routes/supplementRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Gym Sharks API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Gym Sharks API 🦈💪',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      memberships: '/api/memberships',
      workouts: '/api/workouts',
      diets: '/api/diets',
      progress: '/api/progress',
      ai: '/api/ai',
      homeWorkouts: '/api/home-workouts',
      supplements: '/api/supplements',
      health: '/api/health'
    }
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Gym Sharks server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1);
});

module.exports = app;
