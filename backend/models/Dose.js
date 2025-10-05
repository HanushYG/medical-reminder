const mongoose = require('mongoose');

const doseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: [true, 'Medicine ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  },
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'taken', 'missed', 'skipped'],
      message: 'Status must be scheduled, taken, missed, or skipped'
    },
    default: 'scheduled'
  },
  takenAt: {
    type: Date
  },
  missedReason: {
    type: String,
    enum: ['forgot', 'unavailable', 'side-effects', 'other'],
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  effectiveness: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'unknown'],
    default: 'unknown'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  dosageTaken: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
doseSchema.index({ userId: 1, date: -1 });
doseSchema.index({ userId: 1, medicineId: 1, date: -1 });
doseSchema.index({ userId: 1, status: 1, date: -1 });
doseSchema.index({ medicineId: 1, date: -1 });

// Virtual for dose ID (compatible with frontend)
doseSchema.virtual('doseId').get(function() {
  const dateStr = this.date.toISOString().split('T')[0];
  return `${dateStr}|${this.medicineId}|${this.time}`;
});

// Virtual for isLate
doseSchema.virtual('isLate').get(function() {
  if (this.status !== 'taken') return false;
  
  const scheduledTime = new Date(this.date);
  const [hours, minutes] = this.time.split(':').map(Number);
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  return this.takenAt > new Date(scheduledTime.getTime() + 30 * 60000); // 30 minutes late
});

// Instance methods
doseSchema.methods.markAsTaken = function(notes = '', dosageTaken = '') {
  this.status = 'taken';
  this.takenAt = new Date();
  if (notes) this.notes = notes;
  if (dosageTaken) this.dosageTaken = dosageTaken;
  return this.save();
};

doseSchema.methods.markAsMissed = function(reason = 'forgot', notes = '') {
  this.status = 'missed';
  this.missedReason = reason;
  if (notes) this.notes = notes;
  return this.save();
};

doseSchema.methods.markAsSkipped = function(notes = '') {
  this.status = 'skipped';
  if (notes) this.notes = notes;
  return this.save();
};

// Static methods
doseSchema.statics.findByUserAndDate = function(userId, date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).populate('medicineId', 'name dosage times').sort({ time: 1 });
};

doseSchema.statics.findByUserAndDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).populate('medicineId', 'name dosage times').sort({ date: -1, time: 1 });
};

doseSchema.statics.getAdherenceStats = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Pre-save middleware to ensure unique dose per medicine per time per date
doseSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingDose = await this.constructor.findOne({
      userId: this.userId,
      medicineId: this.medicineId,
      date: this.date,
      time: this.time
    });
    
    if (existingDose) {
      return next(new Error('Dose already exists for this medicine at this time on this date'));
    }
  }
  next();
});

module.exports = mongoose.model('Dose', doseSchema);

