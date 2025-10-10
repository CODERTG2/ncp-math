import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  sessionDate: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  sessionTime: {
    type: String,
    required: true
  },
  deviceFingerprint: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  isWithinTimeWindow: {
    type: Boolean,
    required: true
  },
  mathTablesRequired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate check-ins
checkInSchema.index({ userId: 1, sessionDate: 1, sessionTime: 1 }, { unique: true });

// Index for device fingerprint tracking
checkInSchema.index({ deviceFingerprint: 1, sessionDate: 1 });

checkInSchema.statics.canCheckIn = async function(userId, userName, sessionDate, sessionTime, deviceFingerprint) {
  // Check if user has already checked in for this specific session
  const existingCheckIn = await this.findOne({
    userId,
    sessionDate,
    sessionTime
  });

  if (existingCheckIn) {
    return {
      canCheckIn: false,
      reason: 'You have already checked in for this session'
    };
  }

  return {
    canCheckIn: true,
    reason: null
  };
};

checkInSchema.statics.createCheckIn = async function(userId, userName, sessionDate, sessionTime, deviceFingerprint, isWithinTimeWindow, mathTablesRequired = false) {
  const checkIn = new this({
    userId,
    userName,
    sessionDate,
    sessionTime,
    deviceFingerprint,
    isWithinTimeWindow,
    mathTablesRequired
  });

  return await checkIn.save();
};

export default mongoose.model('CheckIn', checkInSchema);
