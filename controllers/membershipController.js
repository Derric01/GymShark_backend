const Membership = require('../models/Membership');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Create new membership
 * @route   POST /api/membership
 * @access  Private
 */
const createMembership = asyncHandler(async (req, res) => {
  const { planType } = req.body;

  if (!planType) {
    return res.status(400).json({
      success: false,
      message: 'Plan type is required'
    });
  }

  // Check if user already has an active membership
  const existingMembership = await Membership.findOne({
    userId: req.user._id,
    isActive: true
  });

  if (existingMembership && !existingMembership.isExpired()) {
    return res.status(400).json({
      success: false,
      message: 'You already have an active membership',
      data: {
        currentMembership: {
          planType: existingMembership.planType,
          daysRemaining: existingMembership.daysRemaining(),
          endDate: existingMembership.endDate
        }
      }
    });
  }

  // Get plan details
  const planDetails = Membership.getPlanDetails(planType);
  
  if (!planDetails) {
    return res.status(400).json({
      success: false,
      message: 'Invalid plan type. Available plans: Basic, Standard, Premium'
    });
  }

  // Deactivate existing memberships
  await Membership.updateMany(
    { userId: req.user._id },
    { isActive: false }
  );

  // Create new membership
  const membership = await Membership.create({
    userId: req.user._id,
    planType,
    amountPaid: planDetails.price,
    features: planDetails.features,
    paymentStatus: 'Success' // Simulating successful payment
  });

  res.status(201).json({
    success: true,
    message: 'Membership created successfully',
    data: {
      membership: {
        id: membership._id,
        planType: membership.planType,
        startDate: membership.startDate,
        endDate: membership.endDate,
        amountPaid: membership.amountPaid,
        features: membership.features,
        daysRemaining: membership.daysRemaining(),
        isActive: membership.isActive,
        paymentStatus: membership.paymentStatus
      }
    }
  });
});

/**
 * @desc    Get current user membership
 * @route   GET /api/membership/me
 * @access  Private
 */
const getCurrentMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.findOne({
    userId: req.user._id,
    isActive: true
  }).sort({ createdAt: -1 });

  if (!membership) {
    return res.status(404).json({
      success: false,
      message: 'No active membership found',
      data: {
        availablePlans: {
          Basic: Membership.getPlanDetails('Basic'),
          Standard: Membership.getPlanDetails('Standard'),
          Premium: Membership.getPlanDetails('Premium')
        }
      }
    });
  }

  // Check if membership is expired and update status
  if (membership.isExpired()) {
    membership.isActive = false;
    await membership.save();
    
    return res.json({
      success: false,
      message: 'Your membership has expired',
      data: {
        expiredMembership: {
          planType: membership.planType,
          endDate: membership.endDate
        },
        availablePlans: {
          Basic: Membership.getPlanDetails('Basic'),
          Standard: Membership.getPlanDetails('Standard'),
          Premium: Membership.getPlanDetails('Premium')
        }
      }
    });
  }

  res.json({
    success: true,
    data: {
      membership: {
        id: membership._id,
        planType: membership.planType,
        startDate: membership.startDate,
        endDate: membership.endDate,
        amountPaid: membership.amountPaid,
        features: membership.features,
        daysRemaining: membership.daysRemaining(),
        isActive: membership.isActive,
        paymentStatus: membership.paymentStatus
      }
    }
  });
});

/**
 * @desc    Get membership history
 * @route   GET /api/membership/history
 * @access  Private
 */
const getMembershipHistory = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select('-userId');

  res.json({
    success: true,
    count: memberships.length,
    data: {
      memberships: memberships.map(membership => ({
        id: membership._id,
        planType: membership.planType,
        startDate: membership.startDate,
        endDate: membership.endDate,
        amountPaid: membership.amountPaid,
        daysRemaining: membership.daysRemaining(),
        isActive: membership.isActive,
        paymentStatus: membership.paymentStatus,
        isExpired: membership.isExpired()
      }))
    }
  });
});

/**
 * @desc    Get available membership plans
 * @route   GET /api/membership/plans
 * @access  Public
 */
const getAvailablePlans = asyncHandler(async (req, res) => {
  const plans = {
    Basic: Membership.getPlanDetails('Basic'),
    Standard: Membership.getPlanDetails('Standard'),
    Premium: Membership.getPlanDetails('Premium')
  };

  res.json({
    success: true,
    data: {
      plans,
      features: {
        comparison: [
          {
            feature: 'Gym Equipment Access',
            Basic: true,
            Standard: true,
            Premium: true
          },
          {
            feature: 'Basic Workout Plans',
            Basic: true,
            Standard: true,
            Premium: true
          },
          {
            feature: 'Progress Tracking',
            Basic: true,
            Standard: true,
            Premium: true
          },
          {
            feature: 'Detailed Diet Plans',
            Basic: false,
            Standard: true,
            Premium: true
          },
          {
            feature: 'AI-Powered Tips',
            Basic: false,
            Standard: true,
            Premium: true
          },
          {
            feature: 'Advanced Analytics',
            Basic: false,
            Standard: true,
            Premium: true
          },
          {
            feature: 'Personal Trainer Consultation',
            Basic: false,
            Standard: false,
            Premium: true
          },
          {
            feature: 'Custom Meal Plans',
            Basic: false,
            Standard: false,
            Premium: true
          },
          {
            feature: 'Priority Support',
            Basic: false,
            Standard: false,
            Premium: true
          }
        ]
      }
    }
  });
});

/**
 * @desc    Cancel membership
 * @route   PUT /api/membership/cancel
 * @access  Private
 */
const cancelMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.findOne({
    userId: req.user._id,
    isActive: true
  });

  if (!membership) {
    return res.status(404).json({
      success: false,
      message: 'No active membership found to cancel'
    });
  }

  // Mark membership as inactive
  membership.isActive = false;
  await membership.save();

  res.json({
    success: true,
    message: 'Membership cancelled successfully',
    data: {
      cancelledMembership: {
        planType: membership.planType,
        cancelledDate: new Date(),
        originalEndDate: membership.endDate
      }
    }
  });
});

/**
 * @desc    Renew membership
 * @route   POST /api/membership/renew
 * @access  Private
 */
const renewMembership = asyncHandler(async (req, res) => {
  const { planType } = req.body;

  // Get current membership
  const currentMembership = await Membership.findOne({
    userId: req.user._id
  }).sort({ createdAt: -1 });

  const renewalPlanType = planType || (currentMembership?.planType) || 'Basic';
  
  // Get plan details
  const planDetails = Membership.getPlanDetails(renewalPlanType);
  
  if (!planDetails) {
    return res.status(400).json({
      success: false,
      message: 'Invalid plan type for renewal'
    });
  }

  // Deactivate existing memberships
  await Membership.updateMany(
    { userId: req.user._id },
    { isActive: false }
  );

  // Create renewal membership
  const membership = await Membership.create({
    userId: req.user._id,
    planType: renewalPlanType,
    amountPaid: planDetails.price,
    features: planDetails.features,
    paymentStatus: 'Success'
  });

  res.status(201).json({
    success: true,
    message: 'Membership renewed successfully',
    data: {
      membership: {
        id: membership._id,
        planType: membership.planType,
        startDate: membership.startDate,
        endDate: membership.endDate,
        amountPaid: membership.amountPaid,
        features: membership.features,
        daysRemaining: membership.daysRemaining(),
        isActive: membership.isActive,
        paymentStatus: membership.paymentStatus
      }
    }
  });
});

module.exports = {
  createMembership,
  getCurrentMembership,
  getMembershipHistory,
  getAvailablePlans,
  cancelMembership,
  renewMembership
};
