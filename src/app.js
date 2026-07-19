import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Route group
import authRoutes from './routes/authRoutes.js';

const PORT = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Main app routes
// Auth Routes
app.use('/api/auth', authRoutes);

// DB check-up and server start-up
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
