import bcrypt from 'bcryptjs';
import User from './user.model.js';

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    badgeNumber: user.badgeNumber,
    agencyDepartment: user.agencyDepartment,
    contactPhone: user.contactPhone,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function listUsers() {
  const users = await User.find({}).sort({ createdAt: -1 });
  return users.map(publicUser);
}

export async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return publicUser(user);
}

export async function createUser(payload) {
  const {
    email,
    password,
    fullName,
    role = 'submitter',
    badgeNumber,
    agencyDepartment,
    contactPhone,
    isActive = true,
    isVerified = false,
  } = payload;

  if (!email || !password || !fullName) {
    const error = new Error('Email, password, and full name are required');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase().trim(),
    passwordHash,
    fullName,
    role,
    badgeNumber,
    agencyDepartment,
    contactPhone,
    isActive,
    isVerified,
  });

  return publicUser(user);
}

export async function updateUser(userId, payload) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    'email',
    'fullName',
    'role',
    'badgeNumber',
    'agencyDepartment',
    'contactPhone',
    'isActive',
    'isVerified',
  ];

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      if (field === 'email') {
        user.email = payload.email.toLowerCase().trim();
      } else {
        user[field] = payload[field];
      }
    }
  }

  if (payload.password) {
    user.passwordHash = await bcrypt.hash(payload.password, 10);
  }

  await user.save();
  return publicUser(user);
}

export async function deleteUser(userId) {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return { success: true, message: 'User deleted successfully' };
}
