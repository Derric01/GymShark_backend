const mongoose = require('mongoose');
const HomeWorkout = require('../models/HomeWorkout');
const connectDB = require('../config/database');
require('dotenv').config();

const homeWorkoutsData = [
  {
    title: 'Full Body HIIT Blast',
    description: 'High-intensity interval training workout targeting all major muscle groups. Perfect for burning calories and improving cardiovascular fitness in a short time.',
    category: 'HIIT',
    difficulty: 'Intermediate',
    duration: 20,
    equipment: ['None'],
    targetMuscleGroups: ['Full Body'],
    exercises: [
      {
        name: 'Burpees',
        instructions: 'Start standing, drop to squat, kick back to plank, do a push-up, jump feet back to squat, then jump up with arms overhead.',
        sets: 4,
        reps: '30 seconds',
        restTime: 15,
        modifications: {
          beginner: 'Step back to plank instead of jumping, omit push-up',
          advanced: 'Add a tuck jump at the top'
        },
        tips: ['Keep core engaged', 'Land softly on feet', 'Maintain steady breathing']
      },
      {
        name: 'Mountain Climbers',
        instructions: 'Start in plank position, alternate bringing knees to chest rapidly as if running in place.',
        sets: 4,
        reps: '30 seconds',
        restTime: 15,
        modifications: {
          beginner: 'Slow down the pace, step instead of jumping',
          advanced: 'Increase speed and add cross-body movement'
        },
        tips: ['Keep hips level', 'Engage core throughout', 'Quick, controlled movements']
      },
      {
        name: 'Jump Squats',
        instructions: 'Perform a squat, then explosively jump up, landing softly back into squat position.',
        sets: 4,
        reps: '30 seconds',
        restTime: 15,
        modifications: {
          beginner: 'Regular squats without jumping',
          advanced: 'Add 180-degree turns or single-leg jumps'
        },
        tips: ['Land with knees slightly bent', 'Keep chest up', 'Use arms for momentum']
      }
    ],
    warmUp: [
      {
        name: 'Arm Circles',
        duration: '30 seconds',
        instructions: 'Stand with feet shoulder-width apart, make large circles with arms'
      },
      {
        name: 'Leg Swings',
        duration: '30 seconds each leg',
        instructions: 'Hold wall for support, swing leg forward and back, then side to side'
      },
      {
        name: 'High Knees',
        duration: '30 seconds',
        instructions: 'Jog in place bringing knees up to waist level'
      }
    ],
    coolDown: [
      {
        name: 'Standing Forward Fold',
        duration: '30 seconds',
        instructions: 'Stand with feet hip-width apart, slowly fold forward reaching toward ground'
      },
      {
        name: 'Child\'s Pose',
        duration: '1 minute',
        instructions: 'Kneel on floor, sit back on heels, extend arms forward and lower chest'
      }
    ],
    calories: 250,
    tags: ['fat-burning', 'cardio', 'quick'],
    isPopular: true
  },
  {
    title: 'Morning Yoga Flow',
    description: 'Gentle yoga sequence perfect for starting your day. Improves flexibility, balance, and mental clarity while energizing your body.',
    category: 'Yoga',
    difficulty: 'Beginner',
    duration: 25,
    equipment: ['Yoga Mat'],
    targetMuscleGroups: ['Full Body', 'Core', 'Flexibility'],
    exercises: [
      {
        name: 'Sun Salutation A',
        instructions: 'Flow through mountain pose, forward fold, half lift, chaturanga, upward dog, downward dog sequence.',
        sets: 3,
        reps: '1 complete sequence',
        restTime: 30,
        modifications: {
          beginner: 'Step back to plank instead of jumping, modify chaturanga to knees',
          advanced: 'Hold each pose for 5 breaths, add jump transitions'
        },
        tips: ['Focus on breath', 'Move slowly with control', 'Engage core throughout']
      },
      {
        name: 'Warrior II Flow',
        instructions: 'From downward dog, step right foot forward, rise to warrior II, straighten front leg to extended side angle.',
        sets: 2,
        reps: '5 breaths each side',
        restTime: 15,
        modifications: {
          beginner: 'Use blocks for support, shorter holds',
          advanced: 'Add warrior III transition'
        },
        tips: ['Keep front thigh parallel to ground', 'Relax shoulders', 'Breathe deeply']
      },
      {
        name: 'Tree Pose',
        instructions: 'Stand on left foot, place right foot on inner left thigh, hands at heart center or overhead.',
        sets: 2,
        reps: '1 minute each leg',
        restTime: 10,
        modifications: {
          beginner: 'Place foot on calf or use wall for support',
          advanced: 'Close eyes or add arm movements'
        },
        tips: ['Focus on a fixed point', 'Engage standing leg', 'Never place foot on side of knee']
      }
    ],
    warmUp: [
      {
        name: 'Cat-Cow Stretches',
        duration: '1 minute',
        instructions: 'On hands and knees, alternate arching and rounding spine'
      },
      {
        name: 'Neck Rolls',
        duration: '30 seconds',
        instructions: 'Slowly roll head in circles, both directions'
      }
    ],
    coolDown: [
      {
        name: 'Seated Spinal Twist',
        duration: '1 minute each side',
        instructions: 'Sit cross-legged, place right hand behind you, left hand on right knee, twist right'
      },
      {
        name: 'Savasana',
        duration: '3 minutes',
        instructions: 'Lie flat on back, arms at sides, palms up, focus on breathing'
      }
    ],
    calories: 120,
    tags: ['flexibility', 'mindfulness', 'morning'],
    isPopular: true
  },
  {
    title: 'Upper Body Strength Builder',
    description: 'Focused upper body workout using bodyweight exercises. Build strength in chest, shoulders, arms, and back without any equipment.',
    category: 'Strength',
    difficulty: 'Intermediate',
    duration: 30,
    equipment: ['None'],
    targetMuscleGroups: ['Upper Body', 'Chest', 'Back', 'Shoulders', 'Arms'],
    exercises: [
      {
        name: 'Push-Up Variations',
        instructions: 'Standard push-ups, then wide-grip, then diamond push-ups. Maintain plank position throughout.',
        sets: 3,
        reps: '8-12 each variation',
        restTime: 60,
        modifications: {
          beginner: 'Knee push-ups or wall push-ups',
          advanced: 'One-arm push-ups or decline push-ups'
        },
        tips: ['Keep core tight', 'Lower chest to ground', 'Push through palms evenly']
      },
      {
        name: 'Pike Push-Ups',
        instructions: 'Start in downward dog position, lower head toward ground by bending elbows, push back up.',
        sets: 3,
        reps: '6-10',
        restTime: 60,
        modifications: {
          beginner: 'Elevate feet on small step',
          advanced: 'Elevate feet on chair or add single-arm variation'
        },
        tips: ['Target shoulders primarily', 'Keep legs straight', 'Control the movement']
      },
      {
        name: 'Tricep Dips',
        instructions: 'Sit on edge of chair/couch, hands beside hips, lower body by bending elbows, push back up.',
        sets: 3,
        reps: '8-15',
        restTime: 60,
        modifications: {
          beginner: 'Keep feet closer to body',
          advanced: 'Elevate feet on another surface'
        },
        tips: ['Keep elbows close to body', 'Lower until elbows at 90 degrees', 'Push through palms']
      }
    ],
    warmUp: [
      {
        name: 'Arm Swings',
        duration: '30 seconds',
        instructions: 'Swing arms across body and back, then overhead and down'
      },
      {
        name: 'Shoulder Rolls',
        duration: '30 seconds',
        instructions: 'Roll shoulders backward in large circles'
      },
      {
        name: 'Wrist Circles',
        duration: '20 seconds each direction',
        instructions: 'Extend arms, make circles with wrists'
      }
    ],
    coolDown: [
      {
        name: 'Chest Doorway Stretch',
        duration: '30 seconds',
        instructions: 'Place forearm on doorframe, step forward to stretch chest'
      },
      {
        name: 'Overhead Tricep Stretch',
        duration: '30 seconds each arm',
        instructions: 'Reach one arm overhead, bend elbow, pull gently with other hand'
      }
    ],
    calories: 180,
    tags: ['strength', 'upper-body', 'bodyweight'],
    isPopular: false
  },
  {
    title: 'Core Crusher Circuit',
    description: 'Intense core-focused workout targeting all areas of your midsection. Improve core strength, stability, and definition.',
    category: 'Core',
    difficulty: 'Advanced',
    duration: 15,
    equipment: ['None'],
    targetMuscleGroups: ['Core', 'Abs'],
    exercises: [
      {
        name: 'Plank Variations',
        instructions: 'Standard plank for 30 seconds, then side planks 30 seconds each side.',
        sets: 3,
        reps: '30 seconds each',
        restTime: 20,
        modifications: {
          beginner: 'Knee planks or shorter holds',
          advanced: 'Add leg lifts or arm movements'
        },
        tips: ['Keep body in straight line', 'Breathe normally', 'Engage entire core']
      },
      {
        name: 'Russian Twists',
        instructions: 'Sit with knees bent, lean back slightly, rotate torso side to side touching ground beside hips.',
        sets: 3,
        reps: '20 each side',
        restTime: 20,
        modifications: {
          beginner: 'Keep feet on ground',
          advanced: 'Lift feet off ground or hold weight'
        },
        tips: ['Keep chest up', 'Rotate from core, not arms', 'Control the movement']
      },
      {
        name: 'Bicycle Crunches',
        instructions: 'Lie on back, hands behind head, bring opposite elbow to knee while extending other leg.',
        sets: 3,
        reps: '15 each side',
        restTime: 20,
        modifications: {
          beginner: 'Slower pace, shorter range of motion',
          advanced: 'Hold brief pause at top of each rep'
        },
        tips: ['Don\'t pull on neck', 'Focus on bringing ribs to hips', 'Fully extend legs']
      }
    ],
    warmUp: [
      {
        name: 'Standing Side Bends',
        duration: '30 seconds',
        instructions: 'Stand tall, reach one arm overhead and bend to opposite side'
      },
      {
        name: 'Torso Twists',
        duration: '30 seconds',
        instructions: 'Stand with hands on hips, rotate torso left and right'
      }
    ],
    coolDown: [
      {
        name: 'Cobra Stretch',
        duration: '30 seconds',
        instructions: 'Lie face down, press palms down to lift chest'
      },
      {
        name: 'Knee to Chest',
        duration: '30 seconds each leg',
        instructions: 'Lie on back, pull one knee to chest, hold and switch'
      }
    ],
    calories: 100,
    tags: ['core', 'abs', 'quick', 'intense'],
    isPopular: true
  },
  {
    title: 'Beginner\'s Full Body',
    description: 'Perfect introduction to fitness with simple, effective exercises. Build a foundation of strength and movement patterns.',
    category: 'Bodyweight',
    difficulty: 'Beginner',
    duration: 25,
    equipment: ['None'],
    targetMuscleGroups: ['Full Body'],
    exercises: [
      {
        name: 'Wall Push-Ups',
        instructions: 'Stand arm\'s length from wall, place palms flat against wall, push body away and back.',
        sets: 2,
        reps: '8-12',
        restTime: 45,
        modifications: {
          beginner: 'Stand closer to wall',
          advanced: 'Progress to incline push-ups'
        },
        tips: ['Keep body straight', 'Controlled movement', 'Push through palms']
      },
      {
        name: 'Chair Squats',
        instructions: 'Stand in front of chair, lower down to lightly touch chair with hips, stand back up.',
        sets: 2,
        reps: '10-15',
        restTime: 45,
        modifications: {
          beginner: 'Use higher surface or sit down fully',
          advanced: 'Lower chair or add pause at bottom'
        },
        tips: ['Keep chest up', 'Knees track over toes', 'Control the descent']
      },
      {
        name: 'Modified Plank',
        instructions: 'Start on knees and forearms, hold body in straight line from knees to head.',
        sets: 2,
        reps: '15-30 seconds',
        restTime: 45,
        modifications: {
          beginner: 'Start with shorter holds',
          advanced: 'Progress to full plank'
        },
        tips: ['Keep hips level', 'Breathe normally', 'Engage core muscles']
      }
    ],
    warmUp: [
      {
        name: 'Marching in Place',
        duration: '1 minute',
        instructions: 'Lift knees to comfortable height, swing arms naturally'
      },
      {
        name: 'Gentle Arm Circles',
        duration: '30 seconds each direction',
        instructions: 'Small to large circles with arms'
      }
    ],
    coolDown: [
      {
        name: 'Standing Calf Stretch',
        duration: '30 seconds each leg',
        instructions: 'Step one foot back, press heel down, lean forward slightly'
      },
      {
        name: 'Standing Quad Stretch',
        duration: '30 seconds each leg',
        instructions: 'Hold ankle behind you, keep knees together'
      }
    ],
    calories: 120,
    tags: ['beginner-friendly', 'low-impact', 'foundation'],
    isPopular: true
  },
  {
    title: 'Evening Stretch & Relax',
    description: 'Gentle stretching routine perfect for winding down after a long day. Improve flexibility and prepare your body for restful sleep.',
    category: 'Flexibility',
    difficulty: 'Beginner',
    duration: 20,
    equipment: ['Yoga Mat'],
    targetMuscleGroups: ['Full Body'],
    exercises: [
      {
        name: 'Gentle Spinal Twists',
        instructions: 'Sit cross-legged, place one hand behind you, gently twist spine, hold and switch sides.',
        sets: 2,
        reps: '30 seconds each side',
        restTime: 10,
        modifications: {
          beginner: 'Sit in chair if floor is uncomfortable',
          advanced: 'Deepen the twist gradually'
        },
        tips: ['Move slowly', 'Breathe deeply', 'Don\'t force the stretch']
      },
      {
        name: 'Hip Flexor Stretch',
        instructions: 'Kneel on one knee, other foot forward, gently push hips forward to stretch front of hip.',
        sets: 2,
        reps: '30 seconds each leg',
        restTime: 10,
        modifications: {
          beginner: 'Use wall for balance',
          advanced: 'Add side bend for deeper stretch'
        },
        tips: ['Keep back straight', 'Feel stretch in front of hip', 'Don\'t bounce']
      },
      {
        name: 'Shoulder Rolls and Neck Stretch',
        instructions: 'Roll shoulders backward, then gently tilt head to each side, holding stretch.',
        sets: 2,
        reps: '30 seconds each side',
        restTime: 10,
        modifications: {
          beginner: 'Smaller movements',
          advanced: 'Add gentle resistance with hand'
        },
        tips: ['Move slowly', 'Never force neck movements', 'Relax shoulders']
      }
    ],
    warmUp: [
      {
        name: 'Deep Breathing',
        duration: '1 minute',
        instructions: 'Sit comfortably, breathe deeply through nose, exhale slowly through mouth'
      }
    ],
    coolDown: [
      {
        name: 'Progressive Muscle Relaxation',
        duration: '3 minutes',
        instructions: 'Tense and release each muscle group from toes to head'
      },
      {
        name: 'Meditation',
        duration: '2 minutes',
        instructions: 'Sit quietly, focus on breathing, let thoughts pass without judgment'
      }
    ],
    calories: 60,
    tags: ['relaxation', 'flexibility', 'evening', 'stress-relief'],
    isPopular: false
  }
];

const seedHomeWorkouts = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('🔗 Connected to database for seeding home workouts...');

    // Clear existing home workouts
    await HomeWorkout.deleteMany({});
    console.log('🗑️  Cleared existing home workouts');

    // Insert new home workouts
    await HomeWorkout.insertMany(homeWorkoutsData);
    console.log('🌱 Successfully seeded home workouts:');
    
    homeWorkoutsData.forEach(workout => {
      console.log(`   ✅ ${workout.title} (${workout.category} - ${workout.difficulty})`);
    });    console.log('🎉 Home workout seeding completed successfully!');
    
    // Only exit if this file is run directly
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error seeding home workouts:', error);
    
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
  seedHomeWorkouts();
}

module.exports = { seedHomeWorkouts, homeWorkoutsData };
