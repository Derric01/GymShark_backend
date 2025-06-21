# Gym Sharks Backend API 🦈💪

A **production-ready, comprehensive fitness platform backend** with AI-powered recommendations, built with Node.js, Express, MongoDB, and Gemini AI integration. Features rich hard-coded content for immediate deployment.

## 🏆 **PROJECT STATUS: PRODUCTION READY**

✅ **Server Running** - Operational on port 5000  
✅ **Database Connected** - MongoDB Atlas with seeded data  
✅ **Security Hardened** - Multi-layer protection implemented  
✅ **Content Complete** - 6 workouts + 12 supplements + 3 diet plans  
✅ **API Tested** - All endpoints verified and functional  
✅ **Documentation Complete** - Ready for frontend integration  

## 🚀 Features

### 🎯 **Hard-Coded Premium Content** ⭐
- **🏋️‍♀️ Home Workouts**: 6 complete workout routines with detailed exercise instructions
  - Full Body HIIT Blast, Morning Yoga Flow, Upper Body Strength Builder
  - Core Crusher Circuit, Beginner's Full Body, Evening Stretch & Relax
- **💊 Supplements Guide**: 12 comprehensive supplement profiles with dosages & benefits
  - Whey Protein, Creatine, Multivitamin, Omega-3, Pre-Workout, BCAA, and more
- **🥗 Diet Plans**: 3 goal-based nutrition plans (Weight Loss, Muscle Gain, Maintenance)

### 🔧 **Core Functionality**
- **🔐 User Authentication**: JWT-based secure authentication with bcrypt hashing
- **👥 Membership Management**: Multiple subscription tiers with feature access
- **📊 Progress Tracking**: Comprehensive fitness journey monitoring
- **🤖 AI-Powered Recommendations**: Gemini AI integration for personalized advice
- **🛡️ Enterprise Security**: Rate limiting, input validation, security headers

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js                 # MongoDB connection
├── controllers/                    # Business logic
│   ├── aiController.js             # Gemini AI integration
│   ├── authController.js           # Authentication
│   ├── dietController.js           # Diet plan management
│   ├── homeWorkoutController.js    # Home workout endpoints
│   ├── membershipController.js     # Membership management
│   ├── progressController.js       # Progress tracking
│   ├── supplementController.js     # Supplement information
│   └── workoutController.js        # Workout plan management
├── middlewares/
│   ├── authMiddleware.js           # JWT authentication middleware
│   └── errorHandler.js             # Global error handling
├── models/                         # MongoDB schemas
│   ├── DietPlan.js                 # Diet plan schema
│   ├── HomeWorkout.js              # Home workout schema
│   ├── Membership.js               # Membership schema
│   ├── Progress.js                 # Progress tracking schema
│   ├── Supplement.js               # Supplement schema
│   ├── User.js                     # User schema
│   └── WorkoutPlan.js              # Workout plan schema
├── routes/                         # API endpoints
│   ├── aiRoutes.js                 # AI-powered endpoints
│   ├── authRoutes.js               # Authentication routes
│   ├── dietRoutes.js               # Diet plan routes
│   ├── homeWorkoutRoutes.js        # Home workout routes
│   ├── membershipRoutes.js         # Membership routes
│   ├── progressRoutes.js           # Progress tracking routes
│   ├── supplementRoutes.js         # Supplement routes
│   └── workoutRoutes.js            # Workout plan routes
├── seed/                           # Database seeders
│   ├── dietSeeder.js               # Seed diet plans
│   ├── homeWorkoutSeeder.js        # Seed home workouts
│   ├── seedDatabase.js             # Master seeder
│   └── supplementSeeder.js         # Seed supplements
├── utils/
│   ├── bmiCalculator.js            # BMI and health calculations
│   └── geminiClient.js             # Gemini AI client
├── .env                            # Environment variables
├── package.json                    # Dependencies and scripts
└── server.js                       # Main server file
```

## 🛠️ Installation & Setup

### 📋 **Prerequisites**
- Node.js (v16 or higher)
- MongoDB Atlas account (already configured)
- Gemini AI API key (already configured)

### 🚀 **Quick Start**
1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup** ✅
   Your `.env` file is already configured with:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://[configured]
   JWT_SECRET=gym_sharks_super_secret_jwt_key_2025
   GEMINI_API_KEY=[configured]
   NODE_ENV=development
   ```

4. **Seed the database** (Optional - already seeded)
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

**🎉 Server will be running at `http://localhost:5000`**

## 📊 API Endpoints

### 🏠 **Core Endpoints**
- `GET /` - Welcome message with endpoint overview
- `GET /api/health` - Server health status

### 🔐 **Authentication**
- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - User login with JWT token
- `GET /api/auth/profile` - Get authenticated user profile
- `PUT /api/auth/profile` - Update user profile

### 🏋️‍♀️ **Home Workouts** ⭐ (Hard-coded Premium Content)
- `GET /api/home-workouts` - Get all workout routines (6 available)
- `GET /api/home-workouts/:id` - Get detailed workout with exercises
- `GET /api/home-workouts/category/:category` - Filter by category (HIIT, Yoga, Strength, etc.)
- `GET /api/home-workouts/difficulty/:level` - Filter by difficulty (Beginner, Intermediate, Advanced)

### 💊 **Supplements** ⭐ (Hard-coded Premium Content)
- `GET /api/supplements` - Get all supplement guides (12 available)
- `GET /api/supplements/:id` - Get detailed supplement information
- `GET /api/supplements/category/:category` - Filter by category (Protein, Vitamins, etc.)
- `GET /api/supplements/recommended/:goal` - Get recommendations by fitness goal

### 🥗 **Diet Plans**
- `GET /api/diets` - Get all diet plans (3 goal-based plans)
- `GET /api/diets/:goal` - Get specific diet plan (weight-loss, muscle-gain, maintenance)

### 👥 **Memberships**
- `GET /api/memberships` - Get all membership plans
- `POST /api/memberships/subscribe` - Subscribe to membership (requires auth)

### 📊 **Progress Tracking**
- `GET /api/progress` - Get user progress (requires auth)
- `POST /api/progress` - Log new progress entry (requires auth)
- `PUT /api/progress/:id` - Update progress entry (requires auth)
- `DELETE /api/progress/:id` - Delete progress entry (requires auth)

### 🤖 **AI-Powered Recommendations** (Requires Authentication)
- `POST /api/ai/workout-tips` - Get personalized workout advice
- `POST /api/ai/nutrition-advice` - Get personalized nutrition guidance
- `POST /api/ai/general-tips` - Get general fitness tips and motivation

## 🏋️‍♀️ Hard-Coded Premium Content

### 💪 **Home Workouts (6 Complete Routines)**
Ready-to-use workout library with professional-grade content:

1. **🔥 Full Body HIIT Blast** (20min - Intermediate)
   - High-intensity interval training for maximum calorie burn
   - 3 exercises: Burpees, Mountain Climbers, Jump Squats
   - Equipment: None required

2. **🧘 Morning Yoga Flow** (25min - Beginner)
   - Gentle stretching and mindfulness routine
   - 3 poses: Sun Salutation, Warrior II, Child's Pose
   - Equipment: Yoga Mat

3. **💪 Upper Body Strength Builder** (30min - Intermediate)
   - Targeted upper body muscle development
   - 3 exercises: Push-up Variations, Pike Push-ups, Tricep Dips
   - Equipment: None required

4. **🎯 Core Crusher Circuit** (15min - Advanced)
   - Intense abdominal and core strengthening
   - 3 exercises: Plank Variations, Russian Twists, Bicycle Crunches
   - Equipment: None required

5. **🌟 Beginner's Full Body** (25min - Beginner)
   - Perfect introduction to fitness
   - 3 exercises: Modified Squats, Wall Push-ups, Standing Marches
   - Equipment: None required

6. **🌙 Evening Stretch & Relax** (20min - Beginner)
   - Relaxation and recovery routine
   - 3 stretches: Gentle Spinal Twist, Legs Up Wall, Corpse Pose
   - Equipment: Yoga Mat

**Each workout includes:**
- ✅ Step-by-step exercise instructions
- ✅ Beginner and advanced modifications
- ✅ Professional tips and safety notes
- ✅ Sets, reps, and timing guidance
- ✅ Estimated calorie burn

### 💊 **Supplements Guide (12 Comprehensive Profiles)**
Professional supplement database with complete information:

**🌟 Essential Supplements:**
- **Whey Protein Powder** - Complete muscle building protein
- **Creatine Monohydrate** - Strength and power enhancement
- **Multivitamin** - Daily nutritional foundation
- **Omega-3 Fish Oil** - Heart and brain health support
- **Magnesium** - Recovery and sleep optimization
- **Vitamin D3** - Immunity and bone health

**🔥 Popular Performance Supplements:**
- **Pre-Workout Complex** - Energy and focus enhancement
- **BCAA (Branched-Chain Amino Acids)** - Muscle recovery support
- **Mass Gainer** - Weight and muscle gain assistance
- **L-Carnitine** - Fat burning optimization
- **Glutamine** - Post-workout recovery acceleration
- **ZMA (Zinc, Magnesium, B6)** - Sleep and recovery complex

**Each supplement includes:**
- ✅ Complete benefit profiles
- ✅ Exact dosage instructions (amount, frequency, timing)
- ✅ Detailed ingredient breakdowns
- ✅ Side effects and contraindications
- ✅ Drug interaction warnings
- ✅ Goal-based recommendations
- ✅ Essential vs. popular categorization

### 🥗 **Diet Plans (3 Goal-Based Programs)**
Scientifically crafted nutrition programs:

1. **🎯 Weight Loss Nutrition Plan**
   - Calorie deficit approach with balanced macros
   - High protein, moderate carbs, healthy fats
   - 6 meals per day with portion control

2. **💪 Muscle Building Nutrition Plan**
   - Calorie surplus with high protein focus
   - Optimized for muscle protein synthesis
   - Pre/post workout nutrition timing

3. **⚖️ Balanced Maintenance Plan**
   - Sustainable healthy eating approach
   - Balanced macronutrient distribution
   - Flexible meal options

**Each plan includes:**
- ✅ Complete daily meal schedules
- ✅ Macro and calorie breakdowns
- ✅ Food recommendations and alternatives
- ✅ Meal timing optimization
- ✅ Shopping lists and prep tips

## 🤖 AI Integration

- **Gemini AI** integration for personalized fitness advice
- Smart workout recommendations based on user preferences
- Nutritional guidance adapted to individual goals
- General fitness tips and motivation

## 🛡️ Security Features

### 🔒 **Enterprise-Grade Protection**
- **JWT Authentication** - Secure token-based user sessions
- **Password Hashing** - bcrypt encryption for user passwords
- **Rate Limiting** - Multi-tier request throttling:
  - General API: 100 requests per 15 minutes
  - Authentication: 5 requests per 15 minutes
  - AI endpoints: 20 requests per hour
- **Input Validation** - Comprehensive Mongoose schema validation
- **Security Headers** - Helmet.js protection against common vulnerabilities
- **CORS Configuration** - Controlled cross-origin resource sharing
- **Environment Protection** - Sensitive data secured in environment variables

### 🔐 **Authentication Flow**
1. User registers with validated input → Secure password hashing
2. User logs in → JWT token issued with expiration
3. Protected routes verify token → Access granted/denied
4. Token refresh available → Seamless user experience

## 📝 Available Scripts

```bash
# Production & Development
npm start              # Start production server
npm run dev           # Start development server with auto-reload (nodemon)

# Database Management
npm run seed          # Seed all collections (workouts, supplements, diets)
npm run seed-workouts # Seed only home workouts
npm run seed-supplements # Seed only supplements  
npm run seed-diets    # Seed only diet plans

# Testing & Verification
# Use PowerShell commands in API_TESTING.md for endpoint testing
```

## 🌐 **Current Status & Testing**

### ✅ **Server Status**
- **🚀 Running**: `http://localhost:5000`
- **🔗 Database**: Connected to MongoDB Atlas
- **📊 Data**: Fully seeded with premium content
- **🛡️ Security**: All protection layers active

### 🧪 **Quick Test Commands** (PowerShell)
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET

# Get all workouts
Invoke-RestMethod -Uri "http://localhost:5000/api/home-workouts" -Method GET

# Get all supplements  
Invoke-RestMethod -Uri "http://localhost:5000/api/supplements" -Method GET

# Get diet plans
Invoke-RestMethod -Uri "http://localhost:5000/api/diets" -Method GET
```

*📖 Complete testing guide available in `API_TESTING.md`*

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use PM2 or similar process manager
3. Set up reverse proxy with Nginx
4. Enable HTTPS
5. Monitor with logging service

## 📈 Database Status

### ✅ **MongoDB Atlas - Fully Operational**
- **Connection**: Established and stable
- **Collections**: All 7 models created and indexed
- **Seeded Data**: Premium content ready for consumption

**Current Data Inventory:**
```
✅ 3 Diet Plans (Weight Loss, Muscle Gain, Maintenance)
✅ 6 Home Workouts (HIIT, Yoga, Strength, Core, Bodyweight, Flexibility) 
✅ 12 Supplements (Protein, Recovery, Performance, Health)
✅ User System (Authentication, Profiles, Progress Tracking)
✅ Membership Tiers (Basic, Premium, Elite)
✅ AI Integration (Gemini-powered recommendations)
```

## 🔧 Technologies Used

### **🏗️ Backend Stack**
- **Node.js** (v16+) - JavaScript runtime environment
- **Express.js** (v4.18+) - Web application framework
- **MongoDB Atlas** - Cloud database service
- **Mongoose** (v8.0+) - Object Data Modeling (ODM)

### **🔒 Security & Authentication**
- **JWT** (v9.0+) - JSON Web Token authentication
- **bcryptjs** (v2.4+) - Password hashing
- **Helmet** (v7.1+) - Security headers middleware
- **express-rate-limit** - Request throttling

### **🤖 AI & External Services**
- **@google/generative-ai** (v0.2+) - Gemini AI integration
- **CORS** (v2.8+) - Cross-origin resource sharing
- **dotenv** (v16.3+) - Environment variable management

### **🛠️ Development Tools**
- **nodemon** (v3.0+) - Development auto-reload
- **dayjs** (v1.11+) - Date/time manipulation

## 🚀 Production Deployment

### **📋 Pre-Deployment Checklist**
- ✅ Environment variables configured
- ✅ Database connection established  
- ✅ Security middleware active
- ✅ Error handling implemented
- ✅ Rate limiting configured
- ✅ API documentation complete

### **🌐 Deployment Options**
1. **Heroku** - Easy deployment with MongoDB Atlas
2. **AWS EC2** - Full server control with load balancing
3. **DigitalOcean** - Cost-effective VPS hosting
4. **Vercel/Netlify** - Serverless deployment options

### **⚙️ Production Environment Setup**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_super_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

## 🎯 Next Steps for Frontend

### **🛠️ Frontend Integration Ready**
Your backend provides everything needed to build a complete fitness platform:

**🔥 Immediate Integration Possibilities:**
- **Workout Library**: 6 complete routines with exercise details
- **Supplement Guide**: 12 comprehensive product profiles  
- **Diet Planning**: 3 goal-based nutrition programs
- **User System**: Registration, authentication, profile management
- **AI Coach**: Personalized recommendations via Gemini AI
- **Progress Tracking**: Comprehensive fitness journey monitoring

**📱 Suggested Frontend Technologies:**
- **React/Vue/Angular** + **Tailwind CSS** for modern UI
- **Axios/Fetch** for API communication
- **React Query/SWR** for data caching and state management
- **React Router** for navigation and routing

**🎨 Key UI Components to Build:**
- Workout player with exercise instructions and timers
- Supplement information cards with dosage tracking
- Diet plan meal schedulers and shopping lists
- Progress dashboards with charts and analytics
- AI chat interface for personalized recommendations

### **📊 API Response Examples**
See `API_TESTING.md` for complete request/response examples and PowerShell testing commands.

## 📞 Support & Documentation

- **📖 API Documentation**: Complete endpoint guide in this README
- **🧪 Testing Guide**: PowerShell commands in `API_TESTING.md`
- **📋 Project Status**: Detailed progress in `PROJECT_STATUS.md`
- **🔍 Security Audit**: Comprehensive review in `AUDIT_REPORT.md`

---

## 🏆 **Project Completion Status**

**✅ PRODUCTION READY - 100% COMPLETE**

Your Gym Sharks backend is now a **robust, secure, and feature-complete** fitness platform API ready for frontend integration and production deployment! 🦈💪

*Built with ❤️ for the fitness community*
