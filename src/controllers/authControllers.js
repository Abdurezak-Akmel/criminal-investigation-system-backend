import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  createUser,
  getUserByEmail,
  updateVerificationStatus,
  updateUser,
} from '../../database/models/userModels.js';

import {
  createOtp,
  getOtpByUserId,
  deleteOtpByUserId,
} from '../../database/models/otpModels.js';

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminRegistrationEmail,
} from '../utils/email.js';

import { generateToken as generateJwtToken } from '../utils/jwt.js';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function registerUser(req, res) {
  try {
    const { email, password, fullName, role = 'submitter', badgeNumber, agencyDepartment, contactPhone } = req.body;

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({
      email,
      passwordHash,
      role,
      fullName,
      badgeNumber,
      agencyDepartment,
      contactPhone,
      isVerified: false,
    });

    const otp = generateOtp();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // !0 minutes duration
    await createOtp({ userId: user.id, code: otp, expiresAt });

    await sendVerificationEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: 'Account created. Verification email sent.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error('registerUser error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
}

export async function registerAdmin(req, res) {
  try {
    const { email, password, fullName, role = 'referee', badgeNumber, agencyDepartment, contactPhone } = req.body;

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({
      email,
      passwordHash,
      role,
      fullName,
      badgeNumber,
      agencyDepartment,
      contactPhone,
      isVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Admin account created. Log in to get admin dashboard.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error('registerUser error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { email: bodyEmail, otp: bodyOtp, token: bodyToken } = req.body || {};
    const email = bodyEmail || req.query?.email;
    const otp = bodyOtp || req.query?.otp || req.query?.token || bodyToken;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpRecord = await getOtpByUserId(user.id);
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No verification code found' });
    }

    if (otpRecord.code !== otp || new Date(otpRecord.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    await updateVerificationStatus(user.id, true);
    await deleteOtpByUserId(user.id);

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('verifyEmail error:', error);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // User doesn't exist
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Unverified user
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    // Invalid password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateJwtToken(
      { id: user.id, email: user.email, role: user.role },
      '24h'
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error('loginUser error:', error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    // User doesn't exist
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await createOtp({ userId: user.id, code: resetToken, expiresAt });
    await sendPasswordResetEmail(email, resetToken);

    return res.json({ success: true, message: 'Password reset link sent' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ success: false, message: 'Password reset request failed' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpRecord = await getOtpByUserId(user.id);
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No password reset request found' });
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset request' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUser(user.id, { passwordHash });
    await deleteOtpByUserId(user.id);

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ success: false, message: 'Password reset failed' });
  }
}

export async function inviteAdmin(req, res) {
  try {
    const { email } = req.body;

    const inviteToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await createOtp({ userId: null, code: inviteToken, expiresAt });
    await sendAdminRegistrationEmail(email, inviteToken);

    return res.json({ success: true, message: 'Admin registration link sent' });
  } catch (error) {
    console.error('inviteAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Admin invitation failed' });
  }
}

export default {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  inviteAdmin,
};
