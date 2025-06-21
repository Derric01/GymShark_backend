const mongoose = require('mongoose');
const DietPlan = require('../models/DietPlan');
const connectDB = require('../config/database');
require('dotenv').config();

const dietPlansData = [
  {
    goal: 'weight loss',
    title: 'Weight Loss Nutrition Plan',
    description: 'A balanced, calorie-controlled diet plan designed to promote healthy weight loss while maintaining muscle mass and energy levels. This plan focuses on nutrient-dense foods, adequate protein, and sustainable eating habits.',
    meals: [
      {
        time: 'Breakfast',
        items: [
          {
            name: 'Greek Yogurt with Berries',
            calories: 150,
            protein: 15,
            carbs: 20,
            fat: 2,
            quantity: '1 cup',
            notes: 'Choose plain, low-fat Greek yogurt and add fresh berries'
          },
          {
            name: 'Oatmeal with Cinnamon',
            calories: 120,
            protein: 4,
            carbs: 25,
            fat: 2,
            quantity: '1/2 cup dry oats',
            notes: 'Steel-cut oats preferred, add cinnamon for flavor'
          },
          {
            name: 'Green Tea',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            quantity: '1 cup',
            notes: 'Rich in antioxidants and may boost metabolism'
          }
        ]
      },
      {
        time: 'Mid-Morning Snack',
        items: [
          {
            name: 'Apple with Almond Butter',
            calories: 190,
            protein: 4,
            carbs: 25,
            fat: 8,
            quantity: '1 medium apple + 1 tbsp almond butter',
            notes: 'Choose natural almond butter without added sugar'
          }
        ]
      },
      {
        time: 'Lunch',
        items: [
          {
            name: 'Grilled Chicken Salad',
            calories: 250,
            protein: 35,
            carbs: 10,
            fat: 8,
            quantity: '4 oz chicken + 2 cups mixed greens',
            notes: 'Include variety of colorful vegetables'
          },
          {
            name: 'Quinoa',
            calories: 110,
            protein: 4,
            carbs: 20,
            fat: 2,
            quantity: '1/2 cup cooked',
            notes: 'Complete protein source and fiber-rich'
          },
          {
            name: 'Olive Oil Vinaigrette',
            calories: 60,
            protein: 0,
            carbs: 2,
            fat: 6,
            quantity: '1 tbsp',
            notes: 'Use extra virgin olive oil and lemon juice'
          }
        ]
      },
      {
        time: 'Afternoon Snack',
        items: [
          {
            name: 'Carrot Sticks with Hummus',
            calories: 80,
            protein: 3,
            carbs: 12,
            fat: 3,
            quantity: '1 cup carrots + 2 tbsp hummus',
            notes: 'High fiber and satisfying snack'
          }
        ]
      },
      {
        time: 'Dinner',
        items: [
          {
            name: 'Baked Salmon',
            calories: 200,
            protein: 25,
            carbs: 0,
            fat: 12,
            quantity: '4 oz fillet',
            notes: 'Rich in omega-3 fatty acids'
          },
          {
            name: 'Steamed Broccoli',
            calories: 25,
            protein: 3,
            carbs: 5,
            fat: 0,
            quantity: '1 cup',
            notes: 'High in vitamins and minerals'
          },
          {
            name: 'Sweet Potato',
            calories: 100,
            protein: 2,
            carbs: 23,
            fat: 0,
            quantity: '1 medium baked',
            notes: 'Complex carbohydrate source'
          }
        ]
      },
      {
        time: 'Evening Snack',
        items: [
          {
            name: 'Herbal Tea',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            quantity: '1 cup',
            notes: 'Chamomile or peppermint for relaxation'
          }
        ]
      }
    ],
    guidelines: [
      'Drink at least 8 glasses of water daily',
      'Eat slowly and mindfully',
      'Avoid processed foods and sugary drinks',
      'Include a protein source in every meal',
      'Fill half your plate with vegetables at lunch and dinner'
    ],
    restrictions: [
      'Limit added sugars to less than 25g per day',
      'Avoid fried foods and trans fats',
      'Limit alcohol consumption',
      'Reduce portion sizes compared to current intake'
    ]
  },
  {
    goal: 'muscle gain',
    title: 'Muscle Building Nutrition Plan',
    description: 'A high-protein, calorie-dense nutrition plan designed to support muscle growth and recovery. This plan emphasizes adequate protein timing, complex carbohydrates for energy, and healthy fats for hormone production.',
    meals: [
      {
        time: 'Breakfast',
        items: [
          {
            name: 'Scrambled Eggs',
            calories: 200,
            protein: 18,
            carbs: 2,
            fat: 14,
            quantity: '3 large eggs',
            notes: 'Complete protein source with all essential amino acids'
          },
          {
            name: 'Whole Grain Toast',
            calories: 160,
            protein: 6,
            carbs: 30,
            fat: 2,
            quantity: '2 slices',
            notes: 'Choose sprouted grain bread for better nutrition'
          },
          {
            name: 'Avocado',
            calories: 120,
            protein: 2,
            carbs: 6,
            fat: 11,
            quantity: '1/2 medium',
            notes: 'Healthy monounsaturated fats'
          },
          {
            name: 'Orange Juice',
            calories: 110,
            protein: 2,
            carbs: 26,
            fat: 0,
            quantity: '1 cup',
            notes: 'Natural sugars for quick energy'
          }
        ]
      },
      {
        time: 'Mid-Morning Snack',
        items: [
          {
            name: 'Protein Smoothie',
            calories: 300,
            protein: 25,
            carbs: 35,
            fat: 8,
            quantity: '1 serving',
            notes: 'Whey protein, banana, oats, and milk'
          }
        ]
      },
      {
        time: 'Lunch',
        items: [
          {
            name: 'Lean Beef',
            calories: 300,
            protein: 40,
            carbs: 0,
            fat: 15,
            quantity: '5 oz cooked',
            notes: 'Excellent source of protein and creatine'
          },
          {
            name: 'Brown Rice',
            calories: 220,
            protein: 5,
            carbs: 45,
            fat: 2,
            quantity: '1 cup cooked',
            notes: 'Complex carbohydrates for sustained energy'
          },
          {
            name: 'Mixed Vegetables',
            calories: 50,
            protein: 2,
            carbs: 10,
            fat: 1,
            quantity: '1 cup',
            notes: 'Variety of colorful vegetables for micronutrients'
          }
        ]
      },
      {
        time: 'Pre-Workout Snack',
        items: [
          {
            name: 'Banana with Peanut Butter',
            calories: 270,
            protein: 8,
            carbs: 35,
            fat: 12,
            quantity: '1 large banana + 2 tbsp peanut butter',
            notes: 'Quick carbs and protein for workout fuel'
          }
        ]
      },
      {
        time: 'Post-Workout',
        items: [
          {
            name: 'Whey Protein Shake',
            calories: 150,
            protein: 30,
            carbs: 5,
            fat: 2,
            quantity: '1 scoop',
            notes: 'Fast-absorbing protein for muscle recovery'
          },
          {
            name: 'Chocolate Milk',
            calories: 160,
            protein: 8,
            carbs: 26,
            fat: 3,
            quantity: '1 cup',
            notes: 'Optimal carb to protein ratio for recovery'
          }
        ]
      },
      {
        time: 'Dinner',
        items: [
          {
            name: 'Grilled Chicken Breast',
            calories: 250,
            protein: 45,
            carbs: 0,
            fat: 6,
            quantity: '6 oz',
            notes: 'Lean protein source'
          },
          {
            name: 'Quinoa',
            calories: 220,
            protein: 8,
            carbs: 40,
            fat: 4,
            quantity: '1 cup cooked',
            notes: 'Complete protein and complex carbs'
          },
          {
            name: 'Roasted Vegetables',
            calories: 80,
            protein: 3,
            carbs: 15,
            fat: 2,
            quantity: '1.5 cups',
            notes: 'Drizzled with olive oil'
          }
        ]
      },
      {
        time: 'Evening Snack',
        items: [
          {
            name: 'Greek Yogurt with Nuts',
            calories: 200,
            protein: 15,
            carbs: 12,
            fat: 10,
            quantity: '1 cup yogurt + 1 oz mixed nuts',
            notes: 'Casein protein for overnight muscle recovery'
          }
        ]
      }
    ],
    guidelines: [
      'Consume 1.6-2.2g protein per kg body weight daily',
      'Eat every 3-4 hours to maintain protein synthesis',
      'Include protein within 30 minutes post-workout',
      'Stay hydrated, especially during workouts',
      'Get adequate sleep for recovery and hormone production'
    ],
    restrictions: [
      'Avoid empty calories from junk food',
      'Limit excessive fiber around workout times',
      'Don\'t skip meals, especially breakfast',
      'Minimize alcohol as it impairs protein synthesis'
    ]
  },
  {
    goal: 'maintenance',
    title: 'Balanced Maintenance Nutrition Plan',
    description: 'A well-rounded nutrition plan for maintaining current weight and overall health. This plan emphasizes variety, balanced macronutrients, and sustainable eating habits for long-term wellness.',
    meals: [
      {
        time: 'Breakfast',
        items: [
          {
            name: 'Overnight Oats',
            calories: 180,
            protein: 8,
            carbs: 30,
            fat: 4,
            quantity: '1 serving',
            notes: 'Made with rolled oats, milk, and chia seeds'
          },
          {
            name: 'Mixed Berries',
            calories: 60,
            protein: 1,
            carbs: 15,
            fat: 0,
            quantity: '1/2 cup',
            notes: 'Antioxidant-rich blueberries and strawberries'
          },
          {
            name: 'Coffee with Milk',
            calories: 40,
            protein: 2,
            carbs: 4,
            fat: 2,
            quantity: '1 cup',
            notes: 'Can substitute with tea if preferred'
          }
        ]
      },
      {
        time: 'Mid-Morning Snack',
        items: [
          {
            name: 'Whole Grain Crackers with Cheese',
            calories: 150,
            protein: 6,
            carbs: 18,
            fat: 6,
            quantity: '6 crackers + 1 oz cheese',
            notes: 'Choose low-sodium options'
          }
        ]
      },
      {
        time: 'Lunch',
        items: [
          {
            name: 'Turkey and Vegetable Wrap',
            calories: 280,
            protein: 20,
            carbs: 35,
            fat: 8,
            quantity: '1 large wrap',
            notes: 'Use whole wheat tortilla with plenty of vegetables'
          },
          {
            name: 'Side Salad',
            calories: 50,
            protein: 2,
            carbs: 8,
            fat: 2,
            quantity: '1 cup',
            notes: 'Light vinaigrette dressing'
          },
          {
            name: 'Fruit',
            calories: 80,
            protein: 1,
            carbs: 20,
            fat: 0,
            quantity: '1 medium piece',
            notes: 'Seasonal fresh fruit'
          }
        ]
      },
      {
        time: 'Afternoon Snack',
        items: [
          {
            name: 'Trail Mix',
            calories: 160,
            protein: 5,
            carbs: 15,
            fat: 10,
            quantity: '1 oz',
            notes: 'Nuts, seeds, and dried fruit'
          }
        ]
      },
      {
        time: 'Dinner',
        items: [
          {
            name: 'Baked Fish',
            calories: 180,
            protein: 25,
            carbs: 0,
            fat: 8,
            quantity: '4 oz fillet',
            notes: 'Cod, tilapia, or similar white fish'
          },
          {
            name: 'Roasted Potatoes',
            calories: 130,
            protein: 3,
            carbs: 30,
            fat: 0,
            quantity: '1 cup cubed',
            notes: 'Seasoned with herbs'
          },
          {
            name: 'Green Beans',
            calories: 35,
            protein: 2,
            carbs: 8,
            fat: 0,
            quantity: '1 cup',
            notes: 'Steamed or lightly sautéed'
          },
          {
            name: 'Dinner Roll',
            calories: 80,
            protein: 3,
            carbs: 15,
            fat: 1,
            quantity: '1 small',
            notes: 'Whole grain preferred'
          }
        ]
      },
      {
        time: 'Evening Snack',
        items: [
          {
            name: 'Dark Chocolate',
            calories: 50,
            protein: 1,
            carbs: 6,
            fat: 3,
            quantity: '2 small squares',
            notes: '70% cacao or higher for antioxidants'
          }
        ]
      }
    ],
    guidelines: [
      'Follow the 80/20 rule - healthy choices 80% of the time',
      'Include all food groups for balanced nutrition',
      'Practice portion control and mindful eating',
      'Stay active with regular physical activity',
      'Listen to hunger and fullness cues'
    ],
    restrictions: [
      'Moderate alcohol consumption',
      'Limit processed and packaged foods',
      'Avoid extreme dietary restrictions',
      'Don\'t skip meals regularly'
    ]
  }
];

const seedDietPlans = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('🔗 Connected to database for seeding...');

    // Clear existing diet plans
    await DietPlan.deleteMany({});
    console.log('🗑️  Cleared existing diet plans');

    // Insert new diet plans
    await DietPlan.insertMany(dietPlansData);
    console.log('🌱 Successfully seeded diet plans:');
    
    dietPlansData.forEach(plan => {
      console.log(`   ✅ ${plan.title} (${plan.goal})`);    });

    console.log('🎉 Diet plan seeding completed successfully!');
    
    // Only exit if this file is run directly
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error seeding diet plans:', error);
    
    // Only exit if this file is run directly
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error; // Re-throw for parent process to handle
    }
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDietPlans();
}

module.exports = { seedDietPlans, dietPlansData };
