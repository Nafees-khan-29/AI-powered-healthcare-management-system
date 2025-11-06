# Role-Based Authentication Implementation Guide

## Overview
This system implements role-based authentication with three user types:
- **User** → Regular patients
- **Doctor** → Medical practitioners
- **Admin** → System administrators

## File Structure Created

### Frontend Files
1. `frontend/src/utils/authUtils.js` - Authentication utility functions
2. `frontend/src/components/ProtectedRoute.jsx` - Protected route component

### Backend Files
1. `backend/controllers/authController.js` - Authentication controller
2. `backend/routes/authRoutes.js` - Authentication routes

## Implementation Steps

### 1. Update Backend server.js

```javascript
// backend/server.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### 2. Update App.jsx with Protected Routes

```javascript
// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import UserDashboard from './components/Dashboard/UserDashboard';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* User Dashboard - Only for users */}
      <Route
        path="/dashboard/user"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Doctor Dashboard - Only for doctors */}
      <Route
        path="/dashboard/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Dashboard - Only for admins */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Generic Dashboard - Redirects based on role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// Helper component to redirect to correct dashboard
const DashboardRedirect = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (user) {
      redirectToDashboard(user, navigate);
    }
  }, [user, navigate]);
  
  return <div>Redirecting...</div>;
};
```

### 3. Update Login Page to Use Role-Based Auth

```javascript
// frontend/src/pages/Login.jsx or AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { redirectToDashboard } from '../utils/authUtils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        // Redirect based on role
        redirectToDashboard(data.user, navigate);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### 4. Add Logout Functionality

```javascript
// In any component (e.g., Navbar)
import { logoutUser } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    logoutUser(navigate);
  };

  return (
    <nav>
      {user && (
        <>
          <span>Welcome, {user.name} ({user.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
};
```

## Role-Based Redirect Logic

### JavaScript Condition (Core Logic)

```javascript
// Simple if-else approach
function redirectByRole(user, navigate) {
  if (user.role === 'user') {
    navigate('/dashboard/user');
  } else if (user.role === 'doctor') {
    navigate('/dashboard/doctor');
  } else if (user.role === 'admin') {
    navigate('/dashboard/admin');
  } else {
    navigate('/login'); // Unknown role
  }
}

// Switch statement approach (Cleaner)
function redirectByRole(user, navigate) {
  switch (user.role.toLowerCase()) {
    case 'user':
      navigate('/dashboard/user');
      break;
    case 'doctor':
      navigate('/dashboard/doctor');
      break;
    case 'admin':
      navigate('/dashboard/admin');
      break;
    default:
      navigate('/login');
  }
}

// Object mapping approach (Most flexible)
function redirectByRole(user, navigate) {
  const dashboards = {
    user: '/dashboard/user',
    doctor: '/dashboard/doctor',
    admin: '/dashboard/admin',
  };
  
  const path = dashboards[user.role.toLowerCase()] || '/login';
  navigate(path);
}
```

## Test Credentials

### Admin Login
```
Email: admin@healthcare.com
Password: Admin@123456
→ Redirects to: /dashboard/admin
```

### Doctor Login
```
Email: sarah.mitchell@healthcare.com
Password: Doctor@123
→ Redirects to: /dashboard/doctor
```

### User Login (When implemented)
```
Email: user@example.com
Password: User@123
→ Redirects to: /dashboard/user
```

## API Response Format

### Successful Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "name": "Dr. Sarah Mitchell",
    "email": "sarah.mitchell@healthcare.com",
    "role": "doctor",
    "specialization": "Cardiology"
  },
  "token": "jwt-token-here",
  "redirectTo": "/dashboard/doctor"
}
```

### Failed Login Response
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Security Best Practices

1. **Never store passwords in plain text** (Current JSON files are for testing only)
2. **Implement proper JWT tokens** (Replace simple base64 encoding)
3. **Add password hashing** (Use bcrypt)
4. **Implement refresh tokens**
5. **Add rate limiting** to prevent brute force attacks
6. **Use HTTPS** in production
7. **Validate tokens** on every protected route
8. **Add CSRF protection**

## Next Steps

1. ✅ Basic role-based authentication implemented
2. ⏳ Add JWT token generation and verification
3. ⏳ Implement password hashing with bcrypt
4. ⏳ Add MongoDB integration for users
5. ⏳ Create middleware for route protection
6. ⏳ Add session management
7. ⏳ Implement "Remember Me" functionality
8. ⏳ Add email verification
9. ⏳ Implement password reset flow

## Troubleshooting

### Issue: User redirected to wrong dashboard
**Solution:** Check that the role is being set correctly in the response

### Issue: Protected routes not working
**Solution:** Ensure user data is stored in localStorage after login

### Issue: Token expired errors
**Solution:** Implement refresh token logic or increase token expiry time

## File Imports Reference

```javascript
// Use these imports in your components
import { 
  redirectToDashboard, 
  checkUserRole, 
  getDashboardPath,
  isAuthorized,
  getStoredUser,
  logoutUser 
} from '../utils/authUtils';

import ProtectedRoute from '../components/ProtectedRoute';
```

---

**Implementation Status:** ✅ Ready to integrate
**Last Updated:** November 3, 2025
