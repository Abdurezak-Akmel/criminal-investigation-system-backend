import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import seedAdmin from './config/seed.js';

// App Routes
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import userRoutes from './modules/users/user.routes.js';
import caseRoutes from './modules/cases/case.routes.js';
import chainRoutes from './modules/chain-of-custody/chain.routes.js';
import evidenceRoutes from './modules/evidences/evidence.routes.js';
import reportRoutes from './modules/evidences/report.routes.js';

// Error Handling Middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const PORT = process.env.PORT || 5000;
const app = express();

// CORS configuration to allow requests from the client application
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/chain-of-custody', chainRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/reports', reportRoutes);

// Route not found error handling middleware
app.use(notFound);
// General error handling middleware
app.use(errorHandler);

connectDB()
  .then(async () => {
    console.log('MongoDB connected successfully.');
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
