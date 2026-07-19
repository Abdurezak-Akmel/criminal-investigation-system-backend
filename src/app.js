import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import caseRoutes from './modules/cases/case.routes.js';
import chainRoutes from './modules/chain-of-custody/chain.routes.js';
import evidenceRoutes from './modules/evidence/evidence.routes.js';
import reportRoutes from './modules/evidence/report.routes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/chain-of-custody', chainRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
