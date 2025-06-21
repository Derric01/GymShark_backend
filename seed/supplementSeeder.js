const mongoose = require('mongoose');
const Supplement = require('../models/Supplement');
const connectDB = require('../config/database');
require('dotenv').config();

const supplementsData = [
  {
    name: 'Whey Protein Powder',
    category: 'Protein',
    description: 'High-quality complete protein derived from milk. Fast-absorbing and ideal for post-workout muscle recovery and growth.',
    benefits: [
      'Supports muscle protein synthesis',
      'Fast absorption rate',
      'Complete amino acid profile',
      'Convenient and versatile',
      'Supports weight management'
    ],
    recommendedFor: ['muscle gain', 'weight loss', 'maintenance'],
    dosage: {
      amount: '25-30g',
      frequency: '1-2 times daily',
      timing: 'Post-workout and/or between meals',
      instructions: 'Mix with water, milk, or blend into smoothies'
    },
    ingredients: [
      { name: 'Whey Protein Concentrate/Isolate', amount: '20-25g per serving', purpose: 'Primary protein source' },
      { name: 'Natural Flavors', amount: 'Varies', purpose: 'Taste enhancement' },
      { name: 'Lecithin', amount: '1-2g', purpose: 'Mixability improver' }
    ],
    sideEffects: ['Digestive discomfort in lactose-intolerant individuals', 'Possible bloating if consumed in excess'],
    contraindications: ['Severe milk allergy', 'Lactose intolerance (unless using isolate)'],
    interactions: ['None significant'],
    targetGender: 'All',
    ageRange: { min: 18, max: 65 },
    price: { range: '$25-60', currency: 'USD' },
    effectiveness: { rating: 5, evidenceLevel: 'High' },
    tags: ['muscle-building', 'recovery', 'popular'],
    isEssential: true,
    isPopular: true
  },
  {
    name: 'Creatine Monohydrate',
    category: 'Amino Acids',
    description: 'Most researched and effective form of creatine. Increases muscle power, strength, and exercise performance.',
    benefits: [
      'Increases muscle power and strength',
      'Improves high-intensity exercise performance',
      'Supports muscle growth',
      'May improve brain function',
      'Fast muscle recovery'
    ],
    recommendedFor: ['muscle gain', 'maintenance'],
    dosage: {
      amount: '3-5g',
      frequency: 'Daily',
      timing: 'Anytime (consistency matters more than timing)',
      instructions: 'Mix with water or add to protein shake'
    },
    ingredients: [
      { name: 'Creatine Monohydrate', amount: '3-5g per serving', purpose: 'ATP energy production' }
    ],
    sideEffects: ['Slight water retention', 'Mild digestive issues if taken in large doses'],
    contraindications: ['Kidney disease', 'Kidney dysfunction'],
    interactions: ['Caffeine may reduce effectiveness slightly'],
    targetGender: 'All',
    ageRange: { min: 18, max: 65 },
    price: { range: '$15-30', currency: 'USD' },
    effectiveness: { rating: 5, evidenceLevel: 'High' },
    tags: ['strength', 'power', 'well-researched'],
    isEssential: true,
    isPopular: true
  },
  {
    name: 'Multivitamin',
    category: 'Vitamins',
    description: 'Comprehensive blend of essential vitamins and minerals to support overall health and fill nutritional gaps.',
    benefits: [
      'Fills nutritional gaps in diet',
      'Supports immune function',
      'Promotes energy metabolism',
      'Supports bone health',
      'Antioxidant protection'
    ],
    recommendedFor: ['weight loss', 'muscle gain', 'maintenance', 'general health'],
    dosage: {
      amount: '1 tablet/capsule',
      frequency: 'Daily',
      timing: 'With breakfast or first meal',
      instructions: 'Take with food for better absorption'
    },
    ingredients: [
      { name: 'Vitamin A', amount: '900mcg', purpose: 'Vision and immune health' },
      { name: 'Vitamin C', amount: '90mg', purpose: 'Immune support and antioxidant' },
      { name: 'Vitamin D3', amount: '20mcg', purpose: 'Bone health and immune function' },
      { name: 'B-Complex Vitamins', amount: 'Varies', purpose: 'Energy metabolism' },
      { name: 'Calcium', amount: '200mg', purpose: 'Bone health' },
      { name: 'Iron', amount: '18mg', purpose: 'Oxygen transport' }
    ],
    sideEffects: ['Nausea if taken on empty stomach', 'Urine color changes (harmless)'],
    contraindications: ['Iron overload disorders', 'Specific vitamin allergies'],
    interactions: ['May affect absorption of some medications'],
    targetGender: 'All',
    ageRange: { min: 18, max: 85 },
    price: { range: '$15-40', currency: 'USD' },
    effectiveness: { rating: 4, evidenceLevel: 'Moderate' },
    tags: ['daily-health', 'foundation', 'comprehensive'],
    isEssential: true,
    isPopular: true
  },
  {
    name: 'Omega-3 Fish Oil',
    category: 'General Health',
    description: 'Essential fatty acids EPA and DHA that support heart health, brain function, and reduce inflammation.',
    benefits: [
      'Supports heart health',
      'Reduces inflammation',
      'Supports brain function',
      'May improve joint health',
      'Supports eye health'
    ],
    recommendedFor: ['weight loss', 'muscle gain', 'maintenance', 'general health'],
    dosage: {
      amount: '1-2g EPA+DHA',
      frequency: 'Daily',
      timing: 'With meals',
      instructions: 'Take with food to improve absorption and reduce fishy aftertaste'
    },
    ingredients: [
      { name: 'EPA (Eicosapentaenoic Acid)', amount: '300-600mg', purpose: 'Anti-inflammatory effects' },
      { name: 'DHA (Docosahexaenoic Acid)', amount: '200-400mg', purpose: 'Brain and eye health' }
    ],
    sideEffects: ['Fishy aftertaste', 'Mild digestive upset', 'Blood thinning at high doses'],
    contraindications: ['Fish allergies', 'Blood clotting disorders'],
    interactions: ['Blood thinning medications'],
    targetGender: 'All',
    ageRange: { min: 18, max: 85 },
    price: { range: '$20-50', currency: 'USD' },
    effectiveness: { rating: 4, evidenceLevel: 'High' },
    tags: ['heart-health', 'anti-inflammatory', 'brain-health'],
    isEssential: true,
    isPopular: true
  },
  {
    name: 'Pre-Workout Complex',
    category: 'Pre-Workout',
    description: 'Energizing blend designed to enhance workout performance, focus, and endurance during training sessions.',
    benefits: [
      'Increases energy and focus',
      'Enhances workout performance',
      'Improves endurance',
      'Better muscle pumps',
      'Delays fatigue'
    ],
    recommendedFor: ['muscle gain', 'maintenance'],
    dosage: {
      amount: '1 scoop',
      frequency: '1-2 times daily',
      timing: '15-30 minutes before workout',
      instructions: 'Mix with 8-12oz water, start with half dose to assess tolerance'
    },
    ingredients: [
      { name: 'Caffeine', amount: '150-300mg', purpose: 'Energy and focus' },
      { name: 'Beta-Alanine', amount: '2-3g', purpose: 'Muscular endurance' },
      { name: 'Citrulline Malate', amount: '4-6g', purpose: 'Blood flow and pumps' },
      { name: 'Creatine', amount: '2-3g', purpose: 'Power and strength' }
    ],
    sideEffects: ['Jitters from caffeine', 'Tingling sensation from beta-alanine', 'Difficulty sleeping if taken late'],
    contraindications: ['Caffeine sensitivity', 'Heart conditions', 'High blood pressure'],
    interactions: ['Other caffeine sources', 'Heart medications'],
    targetGender: 'All',
    ageRange: { min: 18, max: 50 },
    price: { range: '$25-50', currency: 'USD' },
    effectiveness: { rating: 4, evidenceLevel: 'Moderate' },
    tags: ['energy', 'performance', 'focus'],
    isEssential: false,
    isPopular: true
  },
  {
    name: 'BCAA (Branched-Chain Amino Acids)',
    category: 'Amino Acids',
    description: 'Essential amino acids leucine, isoleucine, and valine that support muscle protein synthesis and reduce muscle breakdown.',
    benefits: [
      'Reduces muscle breakdown',
      'Supports muscle recovery',
      'May reduce exercise fatigue',
      'Helps maintain muscle during cutting',
      'Improves exercise endurance'
    ],
    recommendedFor: ['muscle gain', 'weight loss'],
    dosage: {
      amount: '10-15g',
      frequency: '1-2 times daily',
      timing: 'During workout or between meals',
      instructions: 'Mix with water, can be sipped during training'
    },
    ingredients: [
      { name: 'L-Leucine', amount: '5-7g', purpose: 'Primary trigger for muscle protein synthesis' },
      { name: 'L-Isoleucine', amount: '2-3g', purpose: 'Energy production and recovery' },
      { name: 'L-Valine', amount: '2-3g', purpose: 'Energy and muscle recovery' }
    ],
    sideEffects: ['Minimal when used as directed'],
    contraindications: ['Maple syrup urine disease', 'ALS'],
    interactions: ['Diabetes medications (may affect blood sugar)'],
    targetGender: 'All',
    ageRange: { min: 18, max: 65 },
    price: { range: '$20-40', currency: 'USD' },
    effectiveness: { rating: 3, evidenceLevel: 'Moderate' },
    tags: ['recovery', 'muscle-preservation', 'intra-workout'],
    isEssential: false,
    isPopular: true
  },
  {
    name: 'Mass Gainer',
    category: 'Mass Gainers',
    description: 'High-calorie supplement combining protein, carbohydrates, and fats to support weight and muscle gain.',
    benefits: [
      'Provides high calorie content',
      'Supports weight gain',
      'Convenient nutrition source',
      'Muscle building support',
      'Energy for intense training'
    ],
    recommendedFor: ['muscle gain'],
    dosage: {
      amount: '1-2 scoops',
      frequency: '1-2 times daily',
      timing: 'Post-workout or between meals',
      instructions: 'Mix with milk or water, blend with fruits for extra calories'
    },
    ingredients: [
      { name: 'Protein Blend', amount: '25-50g', purpose: 'Muscle building' },
      { name: 'Carbohydrate Complex', amount: '100-250g', purpose: 'Energy and weight gain' },
      { name: 'Healthy Fats', amount: '5-10g', purpose: 'Additional calories and hormones' },
      { name: 'Vitamins and Minerals', amount: 'Varies', purpose: 'Nutritional support' }
    ],
    sideEffects: ['Digestive discomfort if consumed too quickly', 'Unwanted fat gain if overused'],
    contraindications: ['Diabetes (due to high carb content)', 'Lactose intolerance'],
    interactions: ['None significant'],
    targetGender: 'All',
    ageRange: { min: 18, max: 40 },
    price: { range: '$30-60', currency: 'USD' },
    effectiveness: { rating: 4, evidenceLevel: 'Moderate' },
    tags: ['bulking', 'weight-gain', 'high-calorie'],
    isEssential: false,
    isPopular: false
  },
  {
    name: 'L-Carnitine',
    category: 'Fat Burners',
    description: 'Amino acid that helps transport fatty acids into cells for energy production, potentially supporting fat loss.',
    benefits: [
      'May support fat oxidation',
      'Could improve exercise recovery',
      'May enhance endurance',
      'Supports energy production',
      'Antioxidant properties'
    ],
    recommendedFor: ['weight loss', 'endurance'],
    dosage: {
      amount: '2-3g',
      frequency: 'Daily',
      timing: '30 minutes before exercise or with meals',
      instructions: 'Take consistently for best results'
    },
    ingredients: [
      { name: 'L-Carnitine', amount: '2-3g', purpose: 'Fat metabolism and energy production' }
    ],
    sideEffects: ['Nausea', 'Diarrhea at high doses', 'Fishy body odor (rare)'],
    contraindications: ['Seizure disorders', 'Hypothyroidism'],
    interactions: ['Thyroid medications', 'Blood thinners'],
    targetGender: 'All',
    ageRange: { min: 18, max: 65 },
    price: { range: '$15-35', currency: 'USD' },
    effectiveness: { rating: 3, evidenceLevel: 'Moderate' },
    tags: ['fat-loss', 'energy', 'endurance'],
    isEssential: false,
    isPopular: false
  },
  {
    name: 'Magnesium',
    category: 'Minerals',
    description: 'Essential mineral involved in over 300 enzymatic reactions, supporting muscle function, sleep, and recovery.',
    benefits: [
      'Supports muscle function',
      'Improves sleep quality',
      'Reduces muscle cramps',
      'Supports bone health',
      'May reduce stress and anxiety'
    ],
    recommendedFor: ['weight loss', 'muscle gain', 'maintenance', 'recovery'],
    dosage: {
      amount: '200-400mg',
      frequency: 'Daily',
      timing: 'Evening or before bed',
      instructions: 'Take with food to improve absorption'
    },
    ingredients: [
      { name: 'Magnesium Glycinate or Citrate', amount: '200-400mg', purpose: 'Muscle and nervous system support' }
    ],
    sideEffects: ['Diarrhea at high doses', 'Stomach upset'],
    contraindications: ['Kidney disease', 'Heart block'],
    interactions: ['Antibiotics', 'Diuretics', 'Blood pressure medications'],
    targetGender: 'All',
    ageRange: { min: 18, max: 85 },
    price: { range: '$10-25', currency: 'USD' },
    effectiveness: { rating: 4, evidenceLevel: 'High' },
    tags: ['recovery', 'sleep', 'muscle-function'],
    isEssential: true,
    isPopular: false
  },
  {
    name: 'Vitamin D3',
    category: 'Vitamins',
    description: 'Essential vitamin for bone health, immune function, and muscle strength. Many people are deficient, especially in winter.',
    benefits: [
      'Supports bone health',
      'Enhances immune function',
      'May improve muscle strength',
      'Supports mood regulation',
      'Critical for calcium absorption'
    ],
    recommendedFor: ['weight loss', 'muscle gain', 'maintenance', 'general health'],
    dosage: {
      amount: '1000-4000 IU',
      frequency: 'Daily',
      timing: 'With fat-containing meal',
      instructions: 'Take with food for better absorption'
    },
    ingredients: [
      { name: 'Vitamin D3 (Cholecalciferol)', amount: '1000-4000 IU', purpose: 'Bone health and immune function' }
    ],
    sideEffects: ['Hypercalcemia at very high doses', 'Kidney stones (rare)'],
    contraindications: ['Hypercalcemia', 'Kidney stones', 'Sarcoidosis'],
    interactions: ['Thiazide diuretics', 'Calcium channel blockers'],
    targetGender: 'All',
    ageRange: { min: 18, max: 85 },
    price: { range: '$8-20', currency: 'USD' },
    effectiveness: { rating: 5, evidenceLevel: 'High' },
    tags: ['bone-health', 'immune-support', 'deficiency-common'],
    isEssential: true,
    isPopular: true
  },
  {
    name: 'Glutamine',
    category: 'Recovery',
    description: 'Amino acid that supports immune function, gut health, and muscle recovery, especially during intense training.',
    benefits: [
      'Supports immune function',
      'May improve gut health',
      'Aids muscle recovery',
      'Reduces muscle soreness',
      'Supports protein synthesis'
    ],
    recommendedFor: ['muscle gain', 'recovery', 'endurance'],
    dosage: {
      amount: '5-10g',
      frequency: '1-2 times daily',
      timing: 'Post-workout and/or before bed',
      instructions: 'Mix with water or add to protein shake'
    },
    ingredients: [
      { name: 'L-Glutamine', amount: '5-10g', purpose: 'Immune support and recovery' }
    ],
    sideEffects: ['Minimal when used as directed'],
    contraindications: ['Liver disease', 'Seizure disorders'],
    interactions: ['None significant'],
    targetGender: 'All',
    ageRange: { min: 18, max: 65 },
    price: { range: '$15-30', currency: 'USD' },
    effectiveness: { rating: 3, evidenceLevel: 'Moderate' },
    tags: ['recovery', 'immune-support', 'gut-health'],
    isEssential: false,
    isPopular: false
  },
  {
    name: 'ZMA (Zinc, Magnesium, B6)',
    category: 'Recovery',
    description: 'Combination of zinc, magnesium, and vitamin B6 designed to support recovery, sleep quality, and hormone production.',
    benefits: [
      'Improves sleep quality',
      'Supports hormone production',
      'Enhances recovery',
      'Boosts immune function',
      'May increase strength gains'
    ],
    recommendedFor: ['muscle gain', 'recovery', 'maintenance'],
    dosage: {
      amount: '1-2 capsules',
      frequency: 'Daily',
      timing: '30-60 minutes before bed on empty stomach',
      instructions: 'Take away from calcium and dairy products'
    },
    ingredients: [
      { name: 'Zinc', amount: '15-30mg', purpose: 'Hormone production and immune function' },
      { name: 'Magnesium', amount: '400-450mg', purpose: 'Sleep and muscle function' },
      { name: 'Vitamin B6', amount: '10-15mg', purpose: 'Neurotransmitter production' }
    ],
    sideEffects: ['Vivid dreams', 'Stomach upset if not taken properly'],
    contraindications: ['Zinc sensitivity', 'Kidney disease'],
    interactions: ['Antibiotics', 'Calcium supplements'],
    targetGender: 'Male',
    ageRange: { min: 18, max: 65 },
    price: { range: '$12-25', currency: 'USD' },
    effectiveness: { rating: 3, evidenceLevel: 'Moderate' },
    tags: ['sleep', 'recovery', 'hormones'],
    isEssential: false,
    isPopular: false
  }
];

const seedSupplements = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('🔗 Connected to database for seeding supplements...');

    // Clear existing supplements
    await Supplement.deleteMany({});
    console.log('🗑️  Cleared existing supplements');

    // Insert new supplements
    await Supplement.insertMany(supplementsData);
    console.log('🌱 Successfully seeded supplements:');
    
    supplementsData.forEach(supplement => {
      const essential = supplement.isEssential ? '⭐' : '';
      const popular = supplement.isPopular ? '🔥' : '';
      console.log(`   ✅ ${supplement.name} (${supplement.category}) ${essential}${popular}`);
    });

    console.log(`\n📊 Seeding Summary:`);
    console.log(`   Total supplements: ${supplementsData.length}`);
    console.log(`   Essential supplements: ${supplementsData.filter(s => s.isEssential).length}`);
    console.log(`   Popular supplements: ${supplementsData.filter(s => s.isPopular).length}`);
    console.log(`   Categories: ${[...new Set(supplementsData.map(s => s.category))].join(', ')}`);    console.log('🎉 Supplement seeding completed successfully!');
    
    // Only exit if this file is run directly
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error seeding supplements:', error);
    
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
  seedSupplements();
}

module.exports = { seedSupplements, supplementsData };
