import express from 'express';

import {
  registerUser,
  registerAdmin,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  inviteAdmin,
} from '../controllers/authControllers.js';

import authMiddleware from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// User registration route
router.post('/register', registerUser);

// Admin registration route
router.post('/register/admin', registerAdmin);

// User login route
router.post('/login', loginUser);

// Email verification route (GET)
router.get('/verify-email', verifyEmail);

// Password reset request route
router.post('/forgot-password', forgotPassword);

// Password reset submission route
router.post('/reset-password', resetPassword);

// Admin invitation route (Admin Only Route)
router.post('/admin/invite', authMiddleware.verifyToken, requireAdmin, inviteAdmin);

export default router;
