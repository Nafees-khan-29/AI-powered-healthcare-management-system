// Backend authentication routes
// Path: backend/routes/authRoutes.js

import express from 'express';
import { login, verifyAuth, logout, checkRole } from '../controllers/authController.js';

const router = express.Router();

// Login route - handles all roles (user, doctor, admin)
router.post('/login', login);

// Check role based on email (for Clerk integration)
router.post('/check-role', checkRole);

// Verify authentication
router.get('/verify', verifyAuth);

// Logout route
router.post('/logout', logout);

export default router;
