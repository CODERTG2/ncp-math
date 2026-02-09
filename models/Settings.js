import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  penaltyMonth: {
    type: String,
    default: '01', // January by default
    validate: {
      validator: function(v) {
        return /^(0[1-9]|1[0-2])$/.test(v);
      },
      message: props => `${props.value} is not a valid month (01-12)!`
    }
  },
  memberRequirements: {
    New: {
      baseHours: { type: Number, default: 2.5 },
      penaltyRate: { type: Number, default: 0.5 }
    },
    Old: {
      baseHours: { type: Number, default: 1.0 },
      penaltyRate: { type: Number, default: 0.5 }
    },
    Officer: {
        baseHours: { type: Number, default: 0 },
        penaltyRate: { type: Number, default: 0 }
    }
  },
  sessionDefaults: {
    Morning: {
      time: { type: String, default: '7:20 AM - 7:50 AM' },
      duration: { type: Number, default: 0.5 },
      room: { type: String, default: 'Room 103' }
    },
    Lunch: {
      time: { type: String, default: '11:51 AM - 12:21 PM' },
      duration: { type: Number, default: 0.5 },
      room: { type: String, default: 'Library' }
    },
    Afterschool: {
      time: { type: String, default: '3:15 PM - 4:15 PM' },
      duration: { type: Number, default: 1.0 },
      room: { type: String, default: '320' }
    }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  const settings = await this.findOne();
  if (settings) return settings;
  return await this.create({});
};

export default mongoose.model('Settings', settingsSchema);
