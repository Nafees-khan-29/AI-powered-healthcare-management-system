import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    try {
      console.log('Retrying without SSL...');
      const uriWithoutSSL = mongoURI.replace('mongodb+srv://', 'mongodb://');
      await mongoose.connect(uriWithoutSSL, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('MongoDB Connected Successfully (without SSL)');
    } catch (fallbackError) {
      console.error('Fallback connection also failed:', fallbackError.message);
      process.exit(1);
    }
  }
};

export default connectDB;