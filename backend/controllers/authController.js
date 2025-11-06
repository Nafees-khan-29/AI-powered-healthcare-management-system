// Backend authentication controller
// Path: backend/controllers/authController.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Login handler with role-based authentication
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check in admins.json
    const adminData = await fs.readFile(
      path.join(__dirname, '../data/admins.json'),
      'utf-8'
    );
    const admins = JSON.parse(adminData);
    const admin = admins.find(
      (a) => a.email === email && a.password === password && a.active
    );

    if (admin) {
      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: admin.id,
          name: admin.full_name,
          email: admin.email,
          role: 'admin',
          department: admin.department,
          permissions: admin.permissions,
          hospital: admin.hospital,
        },
        token: generateToken(admin.id, 'admin'), // Implement your JWT token
        redirectTo: '/adminDashboard',
      });
    }

    // Check in doctors.json
    const doctorData = await fs.readFile(
      path.join(__dirname, '../data/doctors.json'),
      'utf-8'
    );
    const doctors = JSON.parse(doctorData);
    const doctor = doctors.find(
      (d) => d.email === email && d.password === password && d.active
    );

    if (doctor) {
      return res.status(200).json({
        success: true,
        message: 'Doctor login successful',
        user: {
          id: doctor.id,
          name: doctor.full_name,
          email: doctor.email,
          role: 'doctor',
          specialization: doctor.specialization,
          license_number: doctor.license_number,
          hospital: doctor.hospital,
        },
        token: generateToken(doctor.id, 'doctor'),
        redirectTo: '/doctorDashboard',
      });
    }

    // Check in users collection (from database)
    // This would be your MongoDB query for regular users
    // Example:
    // const user = await User.findOne({ email, active: true });
    // if (user && await user.comparePassword(password)) {
    //   return res.status(200).json({
    //     success: true,
    //     message: 'User login successful',
    //     user: {
    //       id: user._id,
    //       name: user.full_name,
    //       email: user.email,
    //       role: 'user',
    //     },
    //     token: generateToken(user._id, 'user'),
    //     redirectTo: '/dashboard/user',
    //   });
    // }

    // If no match found
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

/**
 * Simple token generator (Replace with proper JWT)
 */
const generateToken = (userId, role) => {
  // TODO: Implement proper JWT token generation
  // For now, returning a simple encoded string
  return Buffer.from(`${userId}:${role}:${Date.now()}`).toString('base64');
};

/**
 * Verify token and get user info
 */
export const verifyAuth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    // TODO: Implement proper JWT verification
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, role] = decoded.split(':');

    return res.status(200).json({
      success: true,
      user: { id: userId, role },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

/**
 * Logout handler
 */
export const logout = async (req, res) => {
  try {
    // If you're using sessions, destroy them here
    // If using JWT, you might want to blacklist the token

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};

/**
 * Check user role based on email (for Clerk integration)
 * This endpoint checks if the email exists in admins.json or doctors.json
 */
export const checkRole = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check in admins.json
    const adminData = await fs.readFile(
      path.join(__dirname, '../data/admins.json'),
      'utf-8'
    );
    const admins = JSON.parse(adminData);
    const admin = admins.find((a) => a.email === email && a.active);

    if (admin) {
      return res.status(200).json({
        success: true,
        user: {
          id: admin.id,
          name: admin.full_name,
          email: admin.email,
          role: 'admin',
          department: admin.department,
          permissions: admin.permissions,
          hospital: admin.hospital,
          employee_id: admin.employee_id,
        },
      });
    }

    // Check in doctors.json
    const doctorData = await fs.readFile(
      path.join(__dirname, '../data/doctors.json'),
      'utf-8'
    );
    const doctors = JSON.parse(doctorData);
    const doctor = doctors.find((d) => d.email === email && d.active);

    if (doctor) {
      return res.status(200).json({
        success: true,
        user: {
          id: doctor.id,
          name: doctor.full_name,
          email: doctor.email,
          role: 'doctor',
          specialization: doctor.specialization,
          license_number: doctor.license_number,
          hospital: doctor.hospital,
          phone: doctor.phone,
        },
      });
    }

    // Not found in admins or doctors - default to user role
    return res.status(200).json({
      success: true,
      user: {
        email: email,
        role: 'user',
      },
    });
  } catch (error) {
    console.error('Check role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error checking role',
      error: error.message,
    });
  }
};
