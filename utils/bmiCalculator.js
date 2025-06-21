/**
 * BMI Calculator Utilities
 */

/**
 * Calculate BMI from weight and height
 * @param {number} weight - Weight in kilograms
 * @param {number} height - Height in centimeters
 * @returns {number} BMI value rounded to 1 decimal place
 */
const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) {
    throw new Error('Invalid weight or height values');
  }
  
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

/**
 * Get BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {object} Category information with status and description
 */
const getBMICategory = (bmi) => {
  if (!bmi || bmi <= 0) {
    throw new Error('Invalid BMI value');
  }

  if (bmi < 18.5) {
    return {
      category: 'Underweight',
      status: 'warning',
      description: 'You may need to gain weight. Consult with a healthcare provider.',
      colorCode: '#FFA500',
      recommendations: [
        'Increase caloric intake with nutrient-dense foods',
        'Focus on strength training to build muscle mass',
        'Consider consulting a nutritionist'
      ]
    };
  } else if (bmi < 25) {
    return {
      category: 'Normal weight',
      status: 'success',
      description: 'You have a healthy weight for your height.',
      colorCode: '#28A745',
      recommendations: [
        'Maintain current lifestyle habits',
        'Continue regular physical activity',
        'Focus on balanced nutrition'
      ]
    };
  } else if (bmi < 30) {
    return {
      category: 'Overweight',
      status: 'warning',
      description: 'You may benefit from weight management strategies.',
      colorCode: '#FFC107',
      recommendations: [
        'Create a moderate caloric deficit',
        'Increase physical activity',
        'Focus on portion control'
      ]
    };
  } else {
    return {
      category: 'Obese',
      status: 'danger',
      description: 'Consider consulting healthcare providers for weight management.',
      colorCode: '#DC3545',
      recommendations: [
        'Seek professional medical advice',
        'Consider structured weight loss program',
        'Focus on gradual, sustainable changes'
      ]
    };
  }
};

/**
 * Calculate ideal weight range based on height
 * @param {number} height - Height in centimeters
 * @returns {object} Ideal weight range
 */
const getIdealWeightRange = (height) => {
  if (!height || height <= 0) {
    throw new Error('Invalid height value');
  }

  const heightInMeters = height / 100;
  const minWeight = 18.5 * (heightInMeters * heightInMeters);
  const maxWeight = 24.9 * (heightInMeters * heightInMeters);

  return {
    min: parseFloat(minWeight.toFixed(1)),
    max: parseFloat(maxWeight.toFixed(1)),
    range: `${parseFloat(minWeight.toFixed(1))} - ${parseFloat(maxWeight.toFixed(1))} kg`
  };
};

/**
 * Calculate daily caloric needs based on user profile
 * @param {object} userProfile - User profile object
 * @returns {object} Caloric needs for different goals
 */
const calculateCaloricNeeds = (userProfile) => {
  const { weight, height, age, gender, goal } = userProfile;

  if (!weight || !height || !age || !gender) {
    throw new Error('Incomplete user profile for caloric calculation');
  }

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  // Apply activity factor (assuming moderate activity)
  const tdee = bmr * 1.55; // Moderate activity multiplier

  // Calculate calories based on goal
  const calculations = {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    'weight loss': Math.round(tdee - 500), // 500 calorie deficit
    'muscle gain': Math.round(tdee + 300), // 300 calorie surplus
    'maintenance': Math.round(tdee)
  };

  return {
    ...calculations,
    recommended: calculations[goal] || calculations.maintenance,
    macros: calculateMacros(calculations[goal] || calculations.maintenance, goal)
  };
};

/**
 * Calculate macronutrient distribution
 * @param {number} calories - Total daily calories
 * @param {string} goal - Fitness goal
 * @returns {object} Macro distribution
 */
const calculateMacros = (calories, goal) => {
  let proteinPercent, carbPercent, fatPercent;

  switch (goal) {
    case 'weight loss':
      proteinPercent = 35;
      carbPercent = 35;
      fatPercent = 30;
      break;
    case 'muscle gain':
      proteinPercent = 30;
      carbPercent = 45;
      fatPercent = 25;
      break;
    default: // maintenance
      proteinPercent = 25;
      carbPercent = 45;
      fatPercent = 30;
  }

  return {
    protein: {
      grams: Math.round((calories * proteinPercent / 100) / 4),
      calories: Math.round(calories * proteinPercent / 100),
      percentage: proteinPercent
    },
    carbs: {
      grams: Math.round((calories * carbPercent / 100) / 4),
      calories: Math.round(calories * carbPercent / 100),
      percentage: carbPercent
    },
    fat: {
      grams: Math.round((calories * fatPercent / 100) / 9),
      calories: Math.round(calories * fatPercent / 100),
      percentage: fatPercent
    }
  };
};

/**
 * Get health insights based on user data
 * @param {object} userProfile - User profile
 * @returns {object} Health insights and recommendations
 */
const getHealthInsights = (userProfile) => {
  const bmi = calculateBMI(userProfile.weight, userProfile.height);
  const bmiCategory = getBMICategory(bmi);
  const idealWeight = getIdealWeightRange(userProfile.height);
  const caloricNeeds = calculateCaloricNeeds(userProfile);

  return {
    bmi: {
      value: bmi,
      ...bmiCategory
    },
    idealWeight,
    caloricNeeds,
    insights: generateInsights(userProfile, bmi, bmiCategory)
  };
};

/**
 * Generate personalized insights
 * @param {object} userProfile - User profile
 * @param {number} bmi - BMI value
 * @param {object} bmiCategory - BMI category info
 * @returns {array} Array of insights
 */
const generateInsights = (userProfile, bmi, bmiCategory) => {
  const insights = [];
  const { goal, age, gender } = userProfile;

  // BMI-based insights
  if (bmiCategory.category === 'Normal weight') {
    insights.push('✅ Your BMI is in the healthy range - great job!');
  } else {
    insights.push(`⚠️ Your BMI indicates ${bmiCategory.category.toLowerCase()} - consider the recommendations provided.`);
  }

  // Goal-specific insights
  if (goal === 'weight loss' && bmiCategory.category === 'Normal weight') {
    insights.push('💡 Since you\'re in a healthy weight range, focus on body composition rather than just weight loss.');
  }

  if (goal === 'muscle gain' && bmiCategory.category === 'Underweight') {
    insights.push('🎯 Perfect goal choice! Building muscle will help you reach a healthier weight.');
  }

  // Age-specific insights
  if (age > 40) {
    insights.push('🏃‍♂️ Include strength training to maintain muscle mass and bone density as you age.');
  }

  if (age < 25) {
    insights.push('⚡ Take advantage of your natural metabolism - establish healthy habits now!');
  }

  return insights;
};

module.exports = {
  calculateBMI,
  getBMICategory,
  getIdealWeightRange,
  calculateCaloricNeeds,
  calculateMacros,
  getHealthInsights
};
