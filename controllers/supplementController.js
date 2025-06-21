const Supplement = require('../models/Supplement');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get all supplements with filtering
 * @route   GET /api/supplements
 * @access  Public
 */
const getSupplements = asyncHandler(async (req, res) => {
  const { 
    category, 
    goal, 
    gender,
    essential,
    popular,
    page = 1, 
    limit = 20,
    search 
  } = req.query;

  // Build filter
  const filter = {};
  
  if (category) filter.category = category;
  if (goal) filter.recommendedFor = { $in: [goal] };
  if (gender && gender !== 'All') filter.targetGender = { $in: [gender, 'All'] };
  if (essential === 'true') filter.isEssential = true;
  if (popular === 'true') filter.isPopular = true;
  
  // Search functionality
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { benefits: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const supplements = await Supplement.find(filter)
    .sort({ isEssential: -1, isPopular: -1, 'effectiveness.rating': -1, name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-ingredients -sideEffects -contraindications -interactions'); // Exclude detailed info for list view

  const total = await Supplement.countDocuments(filter);

  res.json({
    success: true,
    count: supplements.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      supplements: supplements.map(supplement => ({
        id: supplement._id,
        name: supplement.name,
        category: supplement.category,
        description: supplement.description,
        benefits: supplement.benefits.slice(0, 3), // First 3 benefits
        recommendedFor: supplement.recommendedFor,
        dosage: supplement.dosage,
        effectiveness: supplement.effectiveness,
        price: supplement.price,
        isEssential: supplement.isEssential,
        isPopular: supplement.isPopular
      }))
    }
  });
});

/**
 * @desc    Get single supplement with full details
 * @route   GET /api/supplements/:id
 * @access  Public
 */
const getSupplement = asyncHandler(async (req, res) => {
  const supplement = await Supplement.findById(req.params.id);

  if (!supplement) {
    return res.status(404).json({
      success: false,
      message: 'Supplement not found'
    });
  }

  res.json({
    success: true,
    data: {
      supplement: {
        id: supplement._id,
        name: supplement.name,
        category: supplement.category,
        description: supplement.description,
        benefits: supplement.benefits,
        recommendedFor: supplement.recommendedFor,
        dosage: supplement.dosage,
        ingredients: supplement.ingredients,
        sideEffects: supplement.sideEffects,
        contraindications: supplement.contraindications,
        interactions: supplement.interactions,
        targetGender: supplement.targetGender,
        ageRange: supplement.ageRange,
        price: supplement.price,
        effectiveness: supplement.effectiveness,
        tags: supplement.tags,
        isEssential: supplement.isEssential,
        isPopular: supplement.isPopular
      }
    }
  });
});

/**
 * @desc    Get supplements by category
 * @route   GET /api/supplements/category/:category
 * @access  Public
 */
const getSupplementsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 10 } = req.query;

  const supplements = await Supplement.getByCategory(category).limit(parseInt(limit));

  res.json({
    success: true,
    count: supplements.length,
    data: {
      category,
      supplements: supplements.map(supplement => ({
        id: supplement._id,
        name: supplement.name,
        description: supplement.description,
        benefits: supplement.benefits.slice(0, 2),
        dosage: supplement.dosage,
        effectiveness: supplement.effectiveness,
        isEssential: supplement.isEssential
      }))
    }
  });
});

/**
 * @desc    Get supplements by fitness goal
 * @route   GET /api/supplements/goal/:goal
 * @access  Public
 */
const getSupplementsByGoal = asyncHandler(async (req, res) => {
  const { goal } = req.params;
  const { limit = 15 } = req.query;

  const supplements = await Supplement.getByGoal(goal).limit(parseInt(limit));

  res.json({
    success: true,
    count: supplements.length,
    data: {
      goal,
      supplements: supplements.map(supplement => ({
        id: supplement._id,
        name: supplement.name,
        category: supplement.category,
        description: supplement.description,
        benefits: supplement.benefits.slice(0, 3),
        dosage: supplement.dosage,
        effectiveness: supplement.effectiveness,
        price: supplement.price,
        isEssential: supplement.isEssential,
        reasonForRecommendation: getGoalBasedReason(supplement, goal)
      }))
    }
  });
});

/**
 * @desc    Get essential supplements
 * @route   GET /api/supplements/essential
 * @access  Public
 */
const getEssentialSupplements = asyncHandler(async (req, res) => {
  const supplements = await Supplement.getEssentials();

  res.json({
    success: true,
    count: supplements.length,
    data: {
      essentialSupplements: supplements.map(supplement => ({
        id: supplement._id,
        name: supplement.name,
        category: supplement.category,
        description: supplement.description,
        benefits: supplement.benefits,
        dosage: supplement.dosage,
        effectiveness: supplement.effectiveness,
        price: supplement.price,
        recommendedFor: supplement.recommendedFor
      }))
    }
  });
});

/**
 * @desc    Get personalized supplement recommendations
 * @route   GET /api/supplements/recommendations
 * @access  Private
 */
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const { budget, priority = 'all' } = req.query;

  const userProfile = {
    age: user.age,
    gender: user.gender,
    goal: user.goal
  };

  let supplements;

  // Get supplements based on priority
  if (priority === 'essential') {
    supplements = await Supplement.getEssentials();
  } else if (priority === 'goal') {
    supplements = await Supplement.getByGoal(user.goal);
  } else {
    supplements = await Supplement.find({
      $or: [
        { isEssential: true },
        { recommendedFor: { $in: [user.goal] } }
      ]
    }).sort({ isEssential: -1, 'effectiveness.rating': -1 });
  }

  // Get personalized recommendations for each supplement
  const recommendations = supplements.map(supplement => {
    const recommendation = supplement.getPersonalizedRecommendation(userProfile);
    return {
      ...recommendation,
      id: supplement._id,
      price: supplement.price,
      tags: supplement.tags
    };
  }).filter(rec => rec.suitability.suitable);

  // Apply budget filtering if specified
  let filteredRecommendations = recommendations;
  if (budget) {
    filteredRecommendations = filterByBudget(recommendations, budget);
  }

  // Create supplement stack suggestions
  const stacks = createSupplementStacks(filteredRecommendations, user.goal);

  res.json({
    success: true,
    count: filteredRecommendations.length,
    data: {
      personalizedRecommendations: filteredRecommendations.slice(0, 10),
      userProfile,
      supplementStacks: stacks,
      budgetInfo: budget ? { budget, filteredCount: filteredRecommendations.length } : null,
      disclaimer: 'These recommendations are for informational purposes only. Consult a healthcare provider before starting any supplement regimen.'
    }
  });
});

/**
 * @desc    Get supplement categories and filters
 * @route   GET /api/supplements/filters
 * @access  Public
 */
const getSupplementFilters = asyncHandler(async (req, res) => {
  const categories = await Supplement.distinct('category');
  const goals = await Supplement.distinct('recommendedFor');

  // Get supplement counts by category
  const categoryCounts = await Supplement.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      filters: {
        categories: categories.sort(),
        goals: goals.sort(),
        genders: ['All', 'Male', 'Female'],
        priorities: [
          { label: 'Essential Only', value: 'essential' },
          { label: 'Goal-Based', value: 'goal' },
          { label: 'All Supplements', value: 'all' }
        ],
        budgetRanges: [
          { label: 'Budget ($0-50)', value: 'budget' },
          { label: 'Moderate ($51-100)', value: 'moderate' },
          { label: 'Premium ($100+)', value: 'premium' }
        ]
      },
      statistics: {
        totalSupplements: await Supplement.countDocuments(),
        essentialSupplements: await Supplement.countDocuments({ isEssential: true }),
        popularSupplements: await Supplement.countDocuments({ isPopular: true }),
        categoryCounts: categoryCounts.reduce((acc, cat) => {
          acc[cat._id] = cat.count;
          return acc;
        }, {})
      }
    }
  });
});

/**
 * @desc    Get supplement interactions checker
 * @route   POST /api/supplements/interactions
 * @access  Public
 */
const checkSupplementInteractions = asyncHandler(async (req, res) => {
  const { supplementIds } = req.body;

  if (!supplementIds || !Array.isArray(supplementIds) || supplementIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of supplement IDs to check'
    });
  }

  const supplements = await Supplement.find({ _id: { $in: supplementIds } })
    .select('name interactions contraindications sideEffects');

  if (supplements.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No supplements found with provided IDs'
    });
  }

  // Check for interactions
  const interactions = [];
  const allInteractions = supplements.flatMap(s => s.interactions || []);
  const allContraindications = supplements.flatMap(s => s.contraindications || []);
  const allSideEffects = supplements.flatMap(s => s.sideEffects || []);

  // Find common elements that might indicate interactions
  const duplicateInteractions = allInteractions.filter((item, index) => 
    allInteractions.indexOf(item) !== index
  );

  res.json({
    success: true,
    data: {
      checkedSupplements: supplements.map(s => ({
        id: s._id,
        name: s.name
      })),
      interactions: {
        potential: duplicateInteractions,
        warnings: allContraindications,
        combinedSideEffects: [...new Set(allSideEffects)]
      },
      recommendation: duplicateInteractions.length > 0 ? 
        'Potential interactions found. Consult a healthcare provider.' :
        'No obvious interactions detected, but always consult a healthcare provider.',
      disclaimer: 'This is not medical advice. Always consult healthcare professionals.'
    }
  });
});

// Helper Functions

function getGoalBasedReason(supplement, goal) {
  const reasons = {
    'weight loss': {
      'Protein': 'Helps maintain muscle during weight loss',
      'Fat Burners': 'May support metabolism and fat burning',
      'Pre-Workout': 'Increases energy for intense workouts'
    },
    'muscle gain': {
      'Protein': 'Essential for muscle protein synthesis',
      'Mass Gainers': 'Provides additional calories and protein',
      'Amino Acids': 'Supports muscle recovery and growth'
    },
    'maintenance': {
      'Vitamins': 'Supports overall health and wellness',
      'General Health': 'Maintains optimal bodily functions'
    }
  };

  return reasons[goal]?.[supplement.category] || 'Supports your fitness goals';
}

function filterByBudget(recommendations, budget) {
  const budgetRanges = {
    'budget': (price) => price.includes('$') && parseInt(price.match(/\d+/)?.[0] || 0) <= 50,
    'moderate': (price) => price.includes('$') && parseInt(price.match(/\d+/)?.[0] || 0) <= 100,
    'premium': () => true // No upper limit for premium
  };

  const budgetFilter = budgetRanges[budget];
  if (!budgetFilter) return recommendations;

  return recommendations.filter(rec => 
    budgetFilter(rec.price?.range || '$0-50')
  );
}

function createSupplementStacks(recommendations, goal) {
  const stacks = [];

  // Essential Stack
  const essentialSupplements = recommendations.filter(rec => 
    rec.importance === 'Essential'
  ).slice(0, 3);

  if (essentialSupplements.length > 0) {
    stacks.push({
      name: 'Essential Stack',
      description: 'Basic supplements for overall health',
      supplements: essentialSupplements,
      totalCost: 'Varies',
      suitability: 'All fitness levels'
    });
  }

  // Goal-specific stacks
  if (goal === 'weight loss') {
    const weightLossStack = recommendations.filter(rec => 
      ['Protein', 'Fat Burners', 'Pre-Workout'].includes(rec.supplement.category)
    ).slice(0, 3);

    if (weightLossStack.length > 0) {
      stacks.push({
        name: 'Weight Loss Stack',
        description: 'Supplements to support fat loss goals',
        supplements: weightLossStack,
        totalCost: 'Varies',
        suitability: 'Weight loss focused'
      });
    }
  }

  if (goal === 'muscle gain') {
    const muscleGainStack = recommendations.filter(rec => 
      ['Protein', 'Mass Gainers', 'Amino Acids'].includes(rec.supplement.category)
    ).slice(0, 3);

    if (muscleGainStack.length > 0) {
      stacks.push({
        name: 'Muscle Building Stack',
        description: 'Supplements to support muscle growth',
        supplements: muscleGainStack,
        totalCost: 'Varies',
        suitability: 'Muscle building focused'
      });
    }
  }

  return stacks;
}

module.exports = {
  getSupplements,
  getSupplement,
  getSupplementsByCategory,
  getSupplementsByGoal,
  getEssentialSupplements,
  getPersonalizedRecommendations,
  getSupplementFilters,
  checkSupplementInteractions
};
