import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  penaltyMonth: {
    type: String,
    default: '01', // January by default
    validate: {
      validator: function (v) {
        return /^(0[1-9]|1[0-2])$/.test(v);
      },
      message: props => `${props.value} is not a valid month (01-12)!`
    }
  },
  memberRequirements: {
    type: Object,
    default: () => {
      const defaultReqs = {
        New: { baseHours: 2.5, penaltyRate: 0.5 },
        Old: { baseHours: 1.0, penaltyRate: 0.5 },
        Officer: { baseHours: 0, penaltyRate: 0 }
      };

      const months = ['09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];
      const reqs = {};
      months.forEach(m => {
        // Just as an example, maybe Sept requires less by default, but keeping it standard for now.
        reqs[m] = JSON.parse(JSON.stringify(defaultReqs));
      });
      return reqs;
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
settingsSchema.statics.getSettings = async function () {
  const settings = await this.findOne();
  if (settings) {
    // Check if memberRequirements is in the old format (missing the '09' key)
    if (settings.memberRequirements && !settings.memberRequirements['09']) {
      const oldReqs = settings.memberRequirements;
      const months = ['09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];
      const newReqs = {};
      months.forEach(m => {
        newReqs[m] = {
          New: oldReqs.New || { baseHours: 2.5, penaltyRate: 0.5 },
          Old: oldReqs.Old || { baseHours: 1.0, penaltyRate: 0.5 },
          Officer: oldReqs.Officer || { baseHours: 0, penaltyRate: 0 }
        };
      });

      settings.memberRequirements = newReqs;

      // Mark as modified since it's a mixed type / object change
      settings.markModified('memberRequirements');
      await settings.save();
    }
    return settings;
  }
  return await this.create({});
};

export default mongoose.model('Settings', settingsSchema);
