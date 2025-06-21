const mongoose = require('mongoose');
const connectDB = require('../config/database');
require('dotenv').config();

// Import models
const DietPlan = require('../models/DietPlan');
const HomeWorkout = require('../models/HomeWorkout');
const Supplement = require('../models/Supplement');

// Import seed data
const { seedDietPlans } = require('./dietSeeder');
const { seedHomeWorkouts } = require('./homeWorkoutSeeder');
const { seedSupplements } = require('./supplementSeeder');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await DietPlan.deleteMany({});
    await HomeWorkout.deleteMany({});
    await Supplement.deleteMany({});
    
    // Seed Diet Plans
    console.log('🥗 Seeding diet plans...');
    await seedDietPlans();
    
    // Seed Home Workouts
    console.log('🏋️‍♀️ Seeding home workouts...');
    await seedHomeWorkouts();
    
    // Seed Supplements
    console.log('💊 Seeding supplements...');
    await seedSupplements();
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded ${await DietPlan.countDocuments()} diet plans`);
    console.log(`📊 Seeded ${await HomeWorkout.countDocuments()} home workouts`);
    console.log(`📊 Seeded ${await Supplement.countDocuments()} supplements`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
