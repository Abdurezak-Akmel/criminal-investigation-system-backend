import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(MONGODB_URI);
  return mongoose.connection;
}

export async function testConnection() {
  await connectDB();
  return mongoose.connection.readyState === 1;
}

export default connectDB;
