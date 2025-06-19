import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
        maxlength: [100, 'Event name cannot exceed 100 characters']
    },
    eventTime: {
        type: Date,
        required: [true, 'Event date is required']
    },
    eventLocation: {
        type: String,
        trim: true,
        maxlength: [200, 'Event location cannot exceed 200 characters']
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Organizer ID is required']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
