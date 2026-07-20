import express from 'express';
import {
  getAllUsers,
  getUser,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from './user.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { requireAdmin } from '../../middleware/adminMiddleware.js';

const router = express.Router();

// API to create a new user
router.post('/', verifyToken, requireAdmin, createUserHandler);

// API to read all users 
router.get('/', getAllUsers);

// API to read a single user
router.get('/:id', verifyToken, requireAdmin, getUser);

// API to update a user
router.put('/:id', verifyToken, requireAdmin, updateUserHandler);

// API to delete a user
router.delete('/:id', deleteUserHandler);

export default router;
