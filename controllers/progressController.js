const Progress = require('../models/Progress');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Log new progress entry
 * @route   POST /api/progress
 * @access  Private
 */
const logProgress = asyncHandler(async (req, res) => {
  const { 
    weight, 
    bodyFatPercentage, 
    muscleMass, 
    measurements, 
    notes, 
    mood, 
    energyLevel,
    date 
  } = req.body;

  if (!weight) {
    return res.status(400).json({
      success: false,
      message: 'Weight is required'
    });
  }

  // Check if entry already exists for today (prevent duplicates)
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const existingEntry = await Progress.findOne({
    userId: req.user._id,
    date: { $gte: startOfDay, $lt: endOfDay }
  });

  if (existingEntry && !date) {
    return res.status(400).json({
      success: false,
      message: 'Progress entry already exists for today. Use PUT to update.',
      data: { existingEntryId: existingEntry._id }
    });
  }

  const progressData = {
    userId: req.user._id,
    weight: parseFloat(weight),
    ...(bodyFatPercentage && { bodyFatPercentage: parseFloat(bodyFatPercentage) }),
    ...(muscleMass && { muscleMass: parseFloat(muscleMass) }),
    ...(measurements && { measurements }),
    ...(notes && { notes: notes.trim() }),
    ...(mood && { mood }),
    ...(energyLevel && { energyLevel: parseInt(energyLevel) }),
    ...(date && { date: new Date(date) })
  };

  const progress = await Progress.create(progressData);

  // Get weight change from previous entry
  const weightChange = await progress.getWeightChange();

  res.status(201).json({
    success: true,
    message: 'Progress logged successfully',
    data: {
      progress: {
        id: progress._id,
        weight: progress.weight,
        bmi: progress.bmi,
        bmiCategory: progress.getBMICategory(),
        bodyFatPercentage: progress.bodyFatPercentage,
        muscleMass: progress.muscleMass,
        measurements: progress.measurements,
        notes: progress.notes,
        mood: progress.mood,
        energyLevel: progress.energyLevel,
        date: progress.date,
        weightChange
      }
    }
  });
});

/**
 * @desc    Get user progress history
 * @route   GET /api/progress
 * @access  Private
 */
const getProgressHistory = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    startDate, 
    endDate, 
    sortBy = 'date',
    sortOrder = 'desc' 
  } = req.query;

  // Build filter
  const filter = { userId: req.user._id };
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const progressEntries = await Progress.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Progress.countDocuments(filter);

  // Calculate weight changes for each entry
  const enrichedEntries = await Promise.all(
    progressEntries.map(async (entry) => {
      const weightChange = await entry.getWeightChange();
      return {
        id: entry._id,
        weight: entry.weight,
        bmi: entry.bmi,
        bmiCategory: entry.getBMICategory(),
        bodyFatPercentage: entry.bodyFatPercentage,
        muscleMass: entry.muscleMass,
        measurements: entry.measurements,
        notes: entry.notes,
        mood: entry.mood,
        energyLevel: entry.energyLevel,
        date: entry.date,
        weightChange
      };
    })
  );

  res.json({
    success: true,
    count: progressEntries.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      progressEntries: enrichedEntries
    }
  });
});

/**
 * @desc    Get progress summary/analytics
 * @route   GET /api/progress/summary
 * @access  Private
 */
const getProgressSummary = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const userId = req.user._id;

  // Get summary from static method
  const summary = await Progress.getProgressSummary(userId, parseInt(days));

  if (!summary) {
    return res.json({
      success: true,
      data: {
        summary: {
          message: 'No progress data found for the specified period',
          totalEntries: 0
        }
      }
    });
  }

  // Get latest and earliest entries for additional insights
  const latestEntry = await Progress.findOne({ userId }).sort({ date: -1 });
  const earliestEntry = await Progress.findOne({ userId }).sort({ date: 1 });

  // Calculate trends
  const trends = await calculateTrends(userId, parseInt(days));

  res.json({
    success: true,
    data: {
      summary: {
        ...summary,
        trends,
        insights: generateInsights(summary, trends, latestEntry),
        milestones: await checkMilestones(userId, latestEntry, earliestEntry)
      }
    }
  });
});

/**
 * @desc    Update progress entry
 * @route   PUT /api/progress/:id
 * @access  Private
 */
const updateProgressEntry = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!progress) {
    return res.status(404).json({
      success: false,
      message: 'Progress entry not found'
    });
  }

  const allowedUpdates = [
    'weight', 'bodyFatPercentage', 'muscleMass', 
    'measurements', 'notes', 'mood', 'energyLevel'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      progress[field] = req.body[field];
    }
  });

  await progress.save();

  const weightChange = await progress.getWeightChange();

  res.json({
    success: true,
    message: 'Progress entry updated successfully',
    data: {
      progress: {
        id: progress._id,
        weight: progress.weight,
        bmi: progress.bmi,
        bmiCategory: progress.getBMICategory(),
        bodyFatPercentage: progress.bodyFatPercentage,
        muscleMass: progress.muscleMass,
        measurements: progress.measurements,
        notes: progress.notes,
        mood: progress.mood,
        energyLevel: progress.energyLevel,
        date: progress.date,
        weightChange
      }
    }
  });
});

/**
 * @desc    Delete progress entry
 * @route   DELETE /api/progress/:id
 * @access  Private
 */
const deleteProgressEntry = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!progress) {
    return res.status(404).json({
      success: false,
      message: 'Progress entry not found'
    });
  }

  await Progress.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Progress entry deleted successfully'
  });
});

/**
 * @desc    Get progress charts data
 * @route   GET /api/progress/charts
 * @access  Private
 */
const getChartsData = asyncHandler(async (req, res) => {
  const { days = 90, metric = 'weight' } = req.query;
  const userId = req.user._id;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

  const entries = await Progress.find({
    userId,
    date: { $gte: cutoffDate }
  }).sort({ date: 1 });

  if (entries.length === 0) {
    return res.json({
      success: true,
      data: {
        charts: {
          message: 'No data available for charts',
          dataPoints: 0
        }
      }
    });
  }

  // Prepare different chart datasets
  const weightData = entries.map(entry => ({
    date: entry.date,
    value: entry.weight,
    bmi: entry.bmi
  }));

  const bodyCompositionData = entries
    .filter(entry => entry.bodyFatPercentage || entry.muscleMass)
    .map(entry => ({
      date: entry.date,
      bodyFat: entry.bodyFatPercentage,
      muscleMass: entry.muscleMass
    }));

  const moodEnergyData = entries.map(entry => ({
    date: entry.date,
    mood: entry.mood,
    energyLevel: entry.energyLevel
  }));

  const measurementsData = entries
    .filter(entry => entry.measurements)
    .map(entry => ({
      date: entry.date,
      measurements: entry.measurements
    }));

  res.json({
    success: true,
    data: {
      charts: {
        period: `${days} days`,
        dataPoints: entries.length,
        weight: weightData,
        bodyComposition: bodyCompositionData,
        moodEnergy: moodEnergyData,
        measurements: measurementsData,
        trends: await calculateTrends(userId, parseInt(days))
      }
    }
  });
});

// Helper Functions

async function calculateTrends(userId, days) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const entries = await Progress.find({
    userId,
    date: { $gte: cutoffDate }
  }).sort({ date: 1 });

  if (entries.length < 2) return null;

  const latest = entries[entries.length - 1];
  const earliest = entries[0];

  return {
    weight: {
      change: parseFloat((latest.weight - earliest.weight).toFixed(1)),
      trend: latest.weight > earliest.weight ? 'increasing' : 
             latest.weight < earliest.weight ? 'decreasing' : 'stable',
      weeklyAverage: parseFloat(((latest.weight - earliest.weight) / (days / 7)).toFixed(1))
    },
    bmi: {
      change: parseFloat((latest.bmi - earliest.bmi).toFixed(1)),
      trend: latest.bmi > earliest.bmi ? 'increasing' : 
             latest.bmi < earliest.bmi ? 'decreasing' : 'stable'
    },
    energyLevel: {
      average: parseFloat((entries.reduce((sum, entry) => sum + entry.energyLevel, 0) / entries.length).toFixed(1)),
      trend: latest.energyLevel > earliest.energyLevel ? 'improving' : 
             latest.energyLevel < earliest.energyLevel ? 'declining' : 'stable'
    }
  };
}

function generateInsights(summary, trends, latestEntry) {
  const insights = [];

  if (trends?.weight?.trend === 'decreasing' && summary.weightChange.amount < -2) {
    insights.push('🎉 Great progress! You\'re losing weight consistently.');
  } else if (trends?.weight?.trend === 'increasing' && summary.weightChange.amount > 2) {
    insights.push('📈 Weight is trending upward. Consider reviewing your diet and exercise.');
  }

  if (trends?.energyLevel?.average >= 7) {
    insights.push('⚡ Your energy levels are excellent! Keep up the good work.');
  } else if (trends?.energyLevel?.average <= 4) {
    insights.push('😴 Energy levels seem low. Consider sleep, nutrition, and recovery.');
  }

  if (latestEntry?.bmi) {
    const bmiCategory = latestEntry.getBMICategory();
    if (bmiCategory === 'Normal weight') {
      insights.push('✅ Your BMI is in the healthy range.');
    }
  }

  return insights;
}

async function checkMilestones(userId, latestEntry, earliestEntry) {
  if (!latestEntry || !earliestEntry) return [];

  const milestones = [];
  const totalWeightChange = latestEntry.weight - earliestEntry.weight;

  // Weight loss milestones
  if (totalWeightChange <= -5) {
    milestones.push({
      type: 'weight_loss',
      achievement: `Lost ${Math.abs(totalWeightChange).toFixed(1)}kg total`,
      icon: '🏆'
    });
  }

  // Consistency milestones
  const totalEntries = await Progress.countDocuments({ userId });
  if (totalEntries >= 30) {
    milestones.push({
      type: 'consistency',
      achievement: `${totalEntries} progress entries logged`,
      icon: '📈'
    });
  }

  // BMI improvement
  if (earliestEntry.bmi && latestEntry.bmi) {
    const bmiImprovement = Math.abs(latestEntry.bmi - 22.5) < Math.abs(earliestEntry.bmi - 22.5);
    if (bmiImprovement) {
      milestones.push({
        type: 'health',
        achievement: 'BMI moving towards optimal range',
        icon: '💚'
      });
    }
  }

  return milestones;
}

module.exports = {
  logProgress,
  getProgressHistory,
  getProgressSummary,
  updateProgressEntry,
  deleteProgressEntry,
  getChartsData
};
