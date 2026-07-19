import express from 'express';
import {
  registerUser,
  registerAdmin,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  inviteAdmin,
} from './auth.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { requireAdmin } from '../../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/register/admin', registerAdmin);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);
router.post('/verify-otp', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/admin/invite', verifyToken, requireAdmin, inviteAdmin);

export default router;
