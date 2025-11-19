const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [100, 'Medicine name cannot be more than 100 characters']
  },
  dosage: {
    type: String,
    trim: true,
    maxlength: [100, 'Dosage cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  times: [{
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  }],
  schedule: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'as-needed'],
      default: 'daily'
    },
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot be more than 1000 characters']
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  interactions: [{
    medicineName: {
      type: String,
      trim: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    description: {
      type: String,
      trim: true
    }
  }],
  category: {
    type: String,
    enum: ['prescription', 'over-the-counter', 'supplement', 'herbal'],
    default: 'prescription'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  prescribedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
medicineSchema.index({ userId: 1, isActive: 1 });
medicineSchema.index({ name: 'text', description: 'text' });

// Virtual for next dose time
medicineSchema.virtual('nextDoseTime').get(function() {
  if (!this.times || !Array.isArray(this.times) || this.times.length === 0) {
    return null;
  }
  
  const now = new Date();
  
  for (const time of this.times) {
    const [hours, minutes] = time.split(':').map(Number);
    const doseTime = new Date();
    doseTime.setHours(hours, minutes, 0, 0);
    
    if (doseTime > now) {
      return doseTime;
    }
  }
  
  // If no time today, return first time tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [hours, minutes] = this.times[0].split(':').map(Number);
  tomorrow.setHours(hours, minutes, 0, 0);
  return tomorrow;
});

// Static methods
medicineSchema.statics.findByUser = function(userId) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

medicineSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    isActive: true,
    'schedule.startDate': { $lte: endDate },
    $or: [
      { 'schedule.endDate': { $gte: startDate } },
      { 'schedule.endDate': null }
    ]
  });
};

module.exports = mongoose.model('Medicine', medicineSchema);


