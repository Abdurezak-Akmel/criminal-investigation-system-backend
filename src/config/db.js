import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is required for database connection. Please set it in your environment variables.'
    );
  }

  // if db is already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection; 
  }

  // create connection if not connected
  await mongoose.connect(MONGODB_URI);
  return mongoose.connection;
}

/* Used to test connection by directly 
running this file when mongoDB is ready */
export async function testConnection() { // Named Export
  await connectDB();
  return mongoose.connection.readyState === 1;
}

export default connectDB; 
/*(Default Export): This makes it the "main" item of the file. 
The importing file can import it without curly braces and even rename it on the fly. */
