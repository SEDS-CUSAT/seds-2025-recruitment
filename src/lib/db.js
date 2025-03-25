import mongoose from 'mongoose';


async function connectDB() {
    await mongoose.connect(process.env.MONGODB_URI).catch((error) => {
        console.error('MongoDB connection error:', error);
        throw new Error('Failed to connect to the database');
    });
    console.log('MongoDB connected successfully');
}


export default connectDB;