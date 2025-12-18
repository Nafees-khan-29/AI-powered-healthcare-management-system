// Backend authentication routes
// Path: backend/routes/authRoutes.js

import express from 'express';
import { login, verifyAuth, logout, checkRole, getUserByEmail, searchUserByName } from '../controllers/authController.js';

const router = express.Router();

// Login route - handles all roles (user, doctor, admin)
router.post('/login', login);

// Check role based on email (for Clerk integration)
router.post('/check-role', checkRole);

// Search user by name (MUST come before :email route)
router.get('/user/search', searchUserByName);

// Get user details by email
router.get('/user/:email', getUserByEmail);

// Verify authentication
router.get('/verify', verifyAuth);

// Logout route
router.post('/logout', logout);

export default router;
