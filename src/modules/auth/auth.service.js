import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../users/user.model.js';
import { generateToken } from '../../utils/jwt.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminRegistrationEmail,
} from '../../utils/email.js';

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    badgeNumber: user.badgeNumber,
    agencyDepartment: user.agencyDepartment,
    contactPhone: user.contactPhone,
    isVerified: user.isVerified,
  };
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateTokenValue() {
  return crypto.randomBytes(32).toString('hex');
}

export async function registerUser(payload, { verifyImmediately = false } = {}) {
  const {
    email,
    password,
    fullName,
    role = 'submitter',
    badgeNumber,
    agencyDepartment,
    contactPhone,
  } = payload;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = verifyImmediately ? undefined : generateOtp();
  const user = await User.create({
    email,
    passwordHash,
    fullName,
    role,
    badgeNumber,
    agencyDepartment,
    contactPhone,
    isVerified: verifyImmediately,
    otp: otp
      ? {
          code: otp,
          purpose: 'email_verification',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }
      : undefined,
  });

  if (otp) {
    await sendVerificationEmail(email, otp);
  }

  return publicUser(user);
}

export async function verifyEmail({ email, otp }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.otp?.code) {
    const error = new Error('No verification code found');
    error.statusCode = 400;
    throw error;
  }

  if (user.otp.code !== otp || user.otp.expiresAt < new Date()) {
    const error = new Error('Invalid or expired verification code');
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  user.otp = undefined;
  await user.save();
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error('Please verify your email first');
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role }, '24h');
  return { token, user: publicUser(user) };
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const resetToken = generateTokenValue();
  user.otp = {
    code: resetToken,
    purpose: 'password_reset',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
  await user.save();
  await sendPasswordResetEmail(email, resetToken);
}

export async function resetPassword({ email, token, newPassword }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.otp?.code || user.otp.code !== token || user.otp.expiresAt < new Date()) {
    const error = new Error('Invalid or expired reset request');
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  await user.save();
}

export async function inviteAdmin(email) {
  const inviteToken = generateTokenValue();
  await sendAdminRegistrationEmail(email, inviteToken);
  return inviteToken;
}
