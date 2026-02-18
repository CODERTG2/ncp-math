import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: Number,
        default: 1.0 // Default hours granted
    },
    isActive: {
        type: Boolean,
        default: true
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

export default mongoose.model('Meeting', meetingSchema);
