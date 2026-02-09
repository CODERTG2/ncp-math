import mongoose from 'mongoose';

const hourAdjustmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null means "All Users"
    },
    amount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    monthApplied: {
        type: String, // MM format, e.g., '09', '10'
        required: true
    },
    academicYear: {
        type: Number, // e.g. 2025 for 2025-2026 school year
        default: function () {
            const now = new Date();
            return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('HourAdjustment', hourAdjustmentSchema);
