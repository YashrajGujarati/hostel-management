import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('❌ CRITICAL: MONGO_URI environment variable is missing!');
    console.error('   Please check your backend/.env file.');
    process.exit(1);
  }

  // Mask credentials for safe logging
  const maskedURI = MONGO_URI.replace(/:([^@]+)@/, ':****@');
  console.log(`📡 Connecting to MongoDB Atlas...`);
  console.log(`   URI: ${maskedURI}`);

  try {
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

  } catch (error: any) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('   Error:', error.message);
    console.error('');
    console.error('   Troubleshooting:');
    console.error('   1. Check your MONGO_URI in backend/.env');
    console.error('   2. Whitelist your IP in MongoDB Atlas → Network Access → Add 0.0.0.0/0');
    console.error('   3. Verify username/password are correct');
    console.error('\n⚠️ Backend is running, but database operations will fail until connected.');
  }
};

export default mongoose;
