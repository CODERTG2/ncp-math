import mongoose from 'mongoose';

// Connect to MongoDB with Mongoose
async function connectWithMongoose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ncp-math', {
            serverSelectionTimeoutMS: 15000, // Increase the timeout to 15 seconds
            socketTimeoutMS: 45000, // Socket timeout
        });
        console.log('Mongoose connection established successfully');
    } catch (error) {
        console.error('Mongoose connection error:', error);
        process.exit(1); // Exit with failure
    }
}

// Handle connection events
mongoose.connection.on('error', err => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Close the Mongoose connection when the Node process ends
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Mongoose connection closed through app termination');
        process.exit(0);
    } catch (error) {
        console.error('Error closing Mongoose connection:', error);
        process.exit(1);
    }
});

export default connectWithMongoose;
