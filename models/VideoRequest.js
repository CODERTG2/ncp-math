import mongoose from 'mongoose';

const videoRequestSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    videoTitle: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true,
        maxlength: [100, 'Video title cannot exceed 100 characters']
    },
    videoDescription: {
        type: String,
        required: [true, 'Video description is required'],
        trim: true,
        maxlength: [500, 'Video description cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['not started', 'in progress', 'completed'],
        default: 'not started'
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Initially no worker assigned
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

const VideoRequest = mongoose.model('VideoRequest', videoRequestSchema);
export default VideoRequest;