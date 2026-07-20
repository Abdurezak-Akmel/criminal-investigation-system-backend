import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../users/user.model.js';
import { generateToken } from '../../utils/jwt.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminRegistrationEmail,
} from '../../utils/email.js';

const verificationCodes = new Map();
const passwordResetTokens = new Map();

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

function normalizeRole(role) {
  if (role === 'user') {
    return 'submitter';
  }

  return ['submitter', 'referee', 'admin'].includes(role) ? role : 'submitter';
}

function normalizeEmail(email) {
  return email?.toLowerCase().trim();
}

async function generateUniqueBadgeNumber() {
  while (true) {
    const badgeNumber = `BADGE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const existingUser = await User.findOne({ badgeNumber });
    if (!existingUser) {
      return badgeNumber;
    }
  }
}

function storeVerificationCode(email, code) {
  verificationCodes.set(email, {
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
}

function getVerificationCode(email) {
  const record = verificationCodes.get(email);
  if (!record) {
    return null;
  }

  if (record.expiresAt < new Date()) {
    verificationCodes.delete(email);
    return null;
  }

  return record;
}

function clearVerificationCode(email) {
  verificationCodes.delete(email);
}

function storeResetToken(email, token) {
  passwordResetTokens.set(email, {
    token,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });
}

function getResetToken(email) {
  const record = passwordResetTokens.get(email);
  if (!record) {
    return null;
  }

  if (record.expiresAt < new Date()) {
    passwordResetTokens.delete(email);
    return null;
  }

  return record;
}

function clearResetToken(email) {
  passwordResetTokens.delete(email);
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

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password || !fullName) {
    const error = new Error('Email, password, and full name are required');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = verifyImmediately ? undefined : generateOtp();
  const resolvedBadgeNumber = badgeNumber || (await generateUniqueBadgeNumber());
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    fullName,
    role: normalizeRole(role),
    badgeNumber: resolvedBadgeNumber,
    agencyDepartment: agencyDepartment || '',
    contactPhone: contactPhone || payload.contact || '',
    isVerified: verifyImmediately,
  });

  if (otp) {
    storeVerificationCode(normalizedEmail, otp);
    await sendVerificationEmail(normalizedEmail, otp);
  }

  return publicUser(user);
}

export async function verifyEmail({ email, otp }) {
  const normalizedEmail = normalizeEmail(email);
  const verificationRecord = getVerificationCode(normalizedEmail);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!verificationRecord) {
    const error = new Error('No verification code found');
    error.statusCode = 400;
    throw error;
  }

  if (verificationRecord.code !== otp) {
    const error = new Error('Invalid or expired verification code');
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  await user.save();
  clearVerificationCode(normalizedEmail);
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
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
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const resetToken = generateTokenValue();
  storeResetToken(normalizedEmail, resetToken);
  await sendPasswordResetEmail(normalizedEmail, resetToken);
}

export async function resetPassword({ email, token, newPassword }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const resetRecord = getResetToken(normalizedEmail);
  if (!resetRecord || resetRecord.token !== token) {
    const error = new Error('Invalid or expired reset request');
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  clearResetToken(normalizedEmail);
}

export async function inviteAdmin(email) {
  const inviteToken = generateTokenValue();
  await sendAdminRegistrationEmail(email, inviteToken);
  return inviteToken;
}
