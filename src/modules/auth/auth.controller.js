import asyncHandler from '../../utils/asyncHandler.js';
import {
  registerUser as registerUserService,
  verifyEmail as verifyEmailService,
  loginUser as loginUserService,
  requestPasswordReset,
  resetPassword as resetPasswordService,
  inviteAdmin as inviteAdminService,
} from './auth.service.js';

export const registerUser = asyncHandler(async (req, res) => {
  const user = await registerUserService({
    ...req.body,
    contactPhone: req.body.contactPhone || req.body.contact,
    agencyDepartment: req.body.agencyDepartment || req.body.department,
  });
  return res.status(201).json({
    success: true,
    message: 'Account created. Verification email sent.',
    user,
    userId: user.id,
  });
});

export const registerAdmin = asyncHandler(async (req, res) => {
  const user = await registerUserService(
    {
      ...req.body,
      role: 'admin',
      contactPhone: req.body.contactPhone || req.body.contact,
      agencyDepartment: req.body.agencyDepartment || req.body.department,
    },
    { verifyImmediately: true }
  );

  return res.status(201).json({
    success: true,
    message: 'Admin account created.',
    user,
    userId: user.id,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const email = req.body?.email || req.query?.email;
  const otp = req.body?.otp || req.body?.token || req.query?.otp || req.query?.token;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required' });
  }

  await verifyEmailService({ email, otp });
  return res.json({ success: true, message: 'Email verified successfully' });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { token, user } = await loginUserService(req.body);
  return res.json({ success: true, message: 'Login successful', token, user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await requestPasswordReset(req.body.email);
  return res.json({ success: true, message: 'Password reset link sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordService(req.body);
  return res.json({ success: true, message: 'Password reset successfully' });
});

export const inviteAdmin = asyncHandler(async (req, res) => {
  await inviteAdminService(req.body.email);
  return res.json({ success: true, message: 'Admin registration link sent' });
});
