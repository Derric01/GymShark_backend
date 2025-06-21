const DietPlan = require('../models/DietPlan');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get all available diet goals
 * @route   GET /api/diets
 * @access  Public
 */
const getDietGoals = asyncHandler(async (req, res) => {
  const dietPlans = await DietPlan.find()
    .select('goal title description totalCalories totalProtein totalCarbs totalFat')
    .sort({ goal: 1 });

  const availableGoals = DietPlan.getAvailableGoals();

  res.json({
    success: true,
    count: dietPlans.length,
    data: {
      availableGoals,
      dietPlans: dietPlans.map(plan => ({
        goal: plan.goal,
        title: plan.title,
        description: plan.description,
        nutrition: plan.getNutritionSummary()
      }))
    }
  });
});

/**
 * @desc    Get diet plan by goal
 * @route   GET /api/diets/:goal
 * @access  Public
 */
const getDietPlanByGoal = asyncHandler(async (req, res) => {
  const { goal } = req.params;
  
  // Validate goal
  const availableGoals = DietPlan.getAvailableGoals();
  if (!availableGoals.includes(goal)) {
    return res.status(400).json({
      success: false,
      message: `Invalid goal. Available goals: ${availableGoals.join(', ')}`
    });
  }

  const dietPlan = await DietPlan.findOne({ goal });

  if (!dietPlan) {
    return res.status(404).json({
      success: false,
      message: `Diet plan for '${goal}' not found. Available goals: ${availableGoals.join(', ')}`
    });
  }

  res.json({
    success: true,
    data: {
      dietPlan: {
        id: dietPlan._id,
        goal: dietPlan.goal,
        title: dietPlan.title,
        description: dietPlan.description,
        meals: dietPlan.meals,
        nutrition: dietPlan.getNutritionSummary(),
        guidelines: dietPlan.guidelines,
        restrictions: dietPlan.restrictions,
        createdAt: dietPlan.createdAt
      }
    }
  });
});

/**
 * @desc    Get personalized diet recommendations
 * @route   GET /api/diets/recommendations
 * @access  Private
 */
const getDietRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const { goal } = req.query;
  
  const targetGoal = goal || user.goal;
  
  // Get diet plan
  const dietPlan = await DietPlan.findOne({ goal: targetGoal });
  
  if (!dietPlan) {
    return res.status(404).json({
      success: false,
      message: `Diet plan for '${targetGoal}' not found`
    });
  }

  // Calculate user's specific caloric needs
  const { calculateCaloricNeeds, getHealthInsights } = require('../utils/bmiCalculator');
  const caloricNeeds = calculateCaloricNeeds(user.toJSON());
  const healthInsights = getHealthInsights(user.toJSON());

  // Calculate adjustment factor based on user's needs vs plan calories
  const adjustmentFactor = caloricNeeds.recommended / dietPlan.totalCalories;

  // Adjust meal portions
  const adjustedMeals = dietPlan.meals.map(meal => ({
    ...meal.toObject(),
    items: meal.items.map(item => ({
      ...item.toObject(),
      calories: Math.round(item.calories * adjustmentFactor),
      protein: Math.round(item.protein * adjustmentFactor * 10) / 10,
      carbs: Math.round(item.carbs * adjustmentFactor * 10) / 10,
      fat: Math.round(item.fat * adjustmentFactor * 10) / 10
    }))
  }));

  // Generate personalized recommendations
  const recommendations = generatePersonalizedRecommendations(user, dietPlan, caloricNeeds);

  res.json({
    success: true,
    data: {
      personalizedPlan: {
        goal: dietPlan.goal,
        title: `${dietPlan.title} (Personalized for ${user.name})`,
        description: dietPlan.description,
        meals: adjustedMeals,
        targetCalories: caloricNeeds.recommended,
        targetMacros: caloricNeeds.macros,
        guidelines: [...dietPlan.guidelines, ...recommendations.guidelines],
        restrictions: dietPlan.restrictions,
        healthInsights: healthInsights.insights,
        recommendations: recommendations.tips
      }
    }
  });
});

/**
 * @desc    Get meal suggestions for specific time
 * @route   GET /api/diets/meals/:mealTime
 * @access  Public
 */
const getMealSuggestions = asyncHandler(async (req, res) => {
  const { mealTime } = req.params;
  const { goal = 'maintenance', calories } = req.query;

  const validMealTimes = ['Breakfast', 'Mid-Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack'];
  
  if (!validMealTimes.includes(mealTime)) {
    return res.status(400).json({
      success: false,
      message: `Invalid meal time. Valid options: ${validMealTimes.join(', ')}`
    });
  }

  // Get diet plan
  const dietPlan = await DietPlan.findOne({ goal });
  
  if (!dietPlan) {
    return res.status(404).json({
      success: false,
      message: `Diet plan for '${goal}' not found`
    });
  }

  // Find meal for the specified time
  const meal = dietPlan.meals.find(m => m.time === mealTime);
  
  if (!meal) {
    return res.status(404).json({
      success: false,
      message: `No meal suggestions found for ${mealTime}`
    });
  }

  // Calculate meal nutrition
  let mealCalories = 0;
  let mealProtein = 0;
  let mealCarbs = 0;
  let mealFat = 0;

  meal.items.forEach(item => {
    mealCalories += item.calories;
    mealProtein += item.protein;
    mealCarbs += item.carbs;
    mealFat += item.fat;
  });

  res.json({
    success: true,
    data: {
      meal: {
        time: meal.time,
        items: meal.items,
        nutrition: {
          calories: mealCalories,
          protein: mealProtein,
          carbs: mealCarbs,
          fat: mealFat
        },
        suggestions: generateMealSuggestions(mealTime, goal),
        tips: getMealTimeTips(mealTime)
      }
    }
  });
});

/**
 * @desc    Search food items across all diet plans
 * @route   GET /api/diets/search
 * @access  Public
 */
const searchFoodItems = asyncHandler(async (req, res) => {
  const { q, goal, minCalories, maxCalories, minProtein } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  // Build aggregation pipeline
  const pipeline = [
    { $unwind: '$meals' },
    { $unwind: '$meals.items' },
    {
      $match: {
        'meals.items.name': { $regex: q.trim(), $options: 'i' },
        ...(goal && { goal }),
        ...(minCalories && { 'meals.items.calories': { $gte: parseInt(minCalories) } }),
        ...(maxCalories && { 'meals.items.calories': { $lte: parseInt(maxCalories) } }),
        ...(minProtein && { 'meals.items.protein': { $gte: parseInt(minProtein) } })
      }
    },
    {
      $group: {
        _id: '$meals.items.name',
        calories: { $first: '$meals.items.calories' },
        protein: { $first: '$meals.items.protein' },
        carbs: { $first: '$meals.items.carbs' },
        fat: { $first: '$meals.items.fat' },
        quantity: { $first: '$meals.items.quantity' },
        notes: { $first: '$meals.items.notes' },
        foundInGoals: { $addToSet: '$goal' },
        foundInMeals: { $addToSet: '$meals.time' }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 20 }
  ];

  const results = await DietPlan.aggregate(pipeline);

  res.json({
    success: true,
    count: results.length,
    data: {
      searchQuery: q.trim(),
      foodItems: results.map(item => ({
        name: item._id,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        quantity: item.quantity,
        notes: item.notes,
        foundInGoals: item.foundInGoals,
        foundInMeals: item.foundInMeals
      }))
    }
  });
});

// Helper Functions

function generatePersonalizedRecommendations(user, dietPlan, caloricNeeds) {
  const recommendations = {
    guidelines: [],
    tips: []
  };

  // Age-based recommendations
  if (user.age > 40) {
    recommendations.guidelines.push('Focus on calcium and vitamin D rich foods for bone health');
    recommendations.tips.push('Consider smaller, more frequent meals to boost metabolism');
  }

  if (user.age < 25) {
    recommendations.guidelines.push('Take advantage of your natural metabolism with consistent eating patterns');
  }

  // Gender-based recommendations
  if (user.gender === 'female') {
    recommendations.guidelines.push('Ensure adequate iron intake, especially if you exercise regularly');
    recommendations.tips.push('Consider timing carbohydrates around your menstrual cycle for energy optimization');
  }

  // Goal-specific recommendations
  if (user.goal === 'weight loss' && caloricNeeds.recommended < 1500) {
    recommendations.tips.push('Consider a more gradual approach to avoid metabolic slowdown');
  }

  if (user.goal === 'muscle gain') {
    recommendations.tips.push(`Aim for ${Math.round(user.weight * 1.6)}-${Math.round(user.weight * 2.2)}g protein daily`);
  }

  return recommendations;
}

function generateMealSuggestions(mealTime, goal) {
  const suggestions = {
    'Breakfast': [
      'Add berries for antioxidants',
      'Include protein to stay full longer',
      'Consider overnight oats for busy mornings'
    ],
    'Lunch': [
      'Include plenty of vegetables',
      'Choose lean proteins',
      'Add healthy fats like avocado'
    ],
    'Dinner': [
      'Keep it lighter than lunch',
      'Focus on vegetables and lean protein',
      'Avoid heavy carbs close to bedtime'
    ]
  };

  return suggestions[mealTime] || ['Focus on balanced nutrition', 'Stay hydrated', 'Listen to your hunger cues'];
}

function getMealTimeTips(mealTime) {
  const tips = {
    'Breakfast': [
      'Eat within 1-2 hours of waking up',
      'Include protein to stabilize blood sugar',
      'Stay hydrated after the overnight fast'
    ],
    'Lunch': [
      'Time it 4-5 hours after breakfast',
      'Make it your largest meal if possible',
      'Include variety for complete nutrition'
    ],
    'Dinner': [
      'Eat 2-3 hours before bedtime',
      'Keep portions moderate',
      'Focus on easy-to-digest foods'
    ]
  };

  return tips[mealTime] || ['Eat mindfully', 'Chew thoroughly', 'Enjoy your meal'];
}

module.exports = {
  getDietGoals,
  getDietPlanByGoal,
  getDietRecommendations,
  getMealSuggestions,
  searchFoodItems
};
