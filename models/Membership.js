const mongoose = require('mongoose');
const dayjs = require('dayjs');

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    required: [true, 'Plan type is required'],
    enum: ['Basic', 'Standard', 'Premium']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  amountPaid: {
    type: Number,
    required: [true, 'Amount paid is required'],
    min: [0, 'Amount cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Success'
  },
  features: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Set end date before saving (30 days from start)
membershipSchema.pre('save', function(next) {
  if (!this.endDate) {
    this.endDate = dayjs(this.startDate).add(30, 'days').toDate();
  }
  next();
});

// Check if membership is expired
membershipSchema.methods.isExpired = function() {
  return dayjs().isAfter(dayjs(this.endDate));
};

// Get days remaining
membershipSchema.methods.daysRemaining = function() {
  const remaining = dayjs(this.endDate).diff(dayjs(), 'days');
  return remaining > 0 ? remaining : 0;
};

// Static method to get plan pricing
membershipSchema.statics.getPlanDetails = function(planType) {
  const plans = {
    'Basic': {
      price: 29.99,
      features: ['Access to gym equipment', 'Basic workout plans', 'Progress tracking']
    },
    'Standard': {
      price: 49.99,
      features: ['All Basic features', 'Detailed diet plans', 'AI-powered tips', 'Advanced progress analytics']
    },
    'Premium': {
      price: 79.99,
      features: ['All Standard features', 'Personal trainer consultation', 'Custom meal plans', 'Priority support']
    }
  };
  return plans[planType] || null;
};

module.exports = mongoose.model('Membership', membershipSchema);
