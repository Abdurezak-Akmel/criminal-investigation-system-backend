import asyncHandler from '../../utils/asyncHandler.js';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './user.service.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await listUsers();
  return res.json({ success: true, users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  return res.json({ success: true, user });
});

export const createUserHandler = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  return res.status(201).json({ success: true, message: 'User created successfully', user });
});

export const updateUserHandler = asyncHandler(async (req, res) => {
  const user = await updateUser(req.params.id, req.body);
  return res.json({ success: true, message: 'User updated successfully', user });
});

export const deleteUserHandler = asyncHandler(async (req, res) => {
  const result = await deleteUser(req.params.id);
  return res.json(result);
});
