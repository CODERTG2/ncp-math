import mongoose from 'mongoose';

const sessionSignupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  time: {
    type: String,
    required: true
  },
  signupDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['signed_up', 'cancelled', 'attended', 'no_show'],
    default: 'signed_up'
  }
});

// Compound index to prevent duplicate signups
sessionSignupSchema.index({ userId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model('SessionSignup', sessionSignupSchema);
