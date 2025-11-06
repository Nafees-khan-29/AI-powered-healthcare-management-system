# How Clerk Authentication Works with JSON Data

## Overview

Your system now uses **Clerk for authentication** (secure login/signup) and **backend JSON files** for role assignment (admin, doctor, or user).

## The Flow

```
User Signs In with Clerk
         ↓
Frontend gets user's email from Clerk
         ↓
Frontend calls backend: POST /api/auth/check-role
         ↓
Backend checks email in admins.json
         ↓
If found → return admin data
         ↓
If not found → check doctors.json
         ↓
If found → return doctor data
         ↓
If not found → return role: "user"
         ↓
Frontend stores role in localStorage
         ↓
Redirect to appropriate dashboard:
  - admin@healthcare.com → /dashboard/admin
  - doctor@email.com → /dashboard/doctor
  - other@email.com → /dashboard/user
```

## How It Works Step-by-Step

### 1. User Signs In with Clerk
User enters credentials in Clerk's SignIn component. Clerk handles authentication securely.

### 2. Frontend Detects Successful Login

```javascript
// In AuthPage.jsx
const { isSignedIn, user } = useUser();

useEffect(() => {
  if (isSignedIn && user) {
    // Sync with backend to get role
    syncUserWithBackend(user);
  }
}, [isSignedIn, user]);
```

### 3. Frontend Calls Backend to Check Role

```javascript
// In roleService.js
export const getUserRole = async (email) => {
  const response = await fetch('http://localhost:3000/api/auth/check-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  return await response.json();
};
```

### 4. Backend Searches JSON Files

```javascript
// In authController.js - checkRole function

// Step 1: Check admins.json
const admins = JSON.parse(await fs.readFile('admins.json', 'utf-8'));
const admin = admins.find(a => a.email === email && a.active);

if (admin) {
  return {
    success: true,
    user: {
      name: admin.full_name,
      email: admin.email,
      role: 'admin',
      // ... other admin data
    }
  };
}

// Step 2: Check doctors.json
const doctors = JSON.parse(await fs.readFile('doctors.json', 'utf-8'));
const doctor = doctors.find(d => d.email === email && d.active);

if (doctor) {
  return {
    success: true,
    user: {
      name: doctor.full_name,
      email: doctor.email,
      role: 'doctor',
      // ... other doctor data
    }
  };
}

// Step 3: Default to user role
return { success: true, user: { email, role: 'user' } };
```

### 5. Frontend Stores Role and Redirects

```javascript
// In roleService.js
const userData = await syncUserWithBackend(user);
localStorage.setItem('userRole', userData.role);
localStorage.setItem('userData', JSON.stringify(userData));

// Redirect based on role
navigate(getDashboardPath(userData.role));
```

## Example Scenarios

### Scenario 1: Admin Login ✅
```
Email: admin@healthcare.com
Backend checks admins.json → FOUND
Returns: role = "admin"
Redirects to: /dashboard/admin
```

### Scenario 2: Doctor Login ✅
```
Email: sarah.mitchell@healthcare.com
Backend checks admins.json → NOT FOUND
Backend checks doctors.json → FOUND
Returns: role = "doctor"
Redirects to: /dashboard/doctor
```

### Scenario 3: Regular User ✅
```
Email: patient@gmail.com
Backend checks admins.json → NOT FOUND
Backend checks doctors.json → NOT FOUND
Returns: role = "user"
Redirects to: /dashboard/user
```

## Test Credentials

### Admin
```
Email: admin@healthcare.com
(Any password in Clerk - role determined by JSON file)
```

### Doctor
```
Email: sarah.mitchell@healthcare.com
Email: michael.chen@healthcare.com
(Any password in Clerk - role determined by JSON file)
```

### Regular User
```
Email: any other email
```

## Key Files

### Frontend
- `src/services/roleService.js` - Role checking logic
- `src/components/Hero-com/AuthPage.jsx` - Auth with Clerk + role sync

### Backend
- `backend/controllers/authController.js` - `checkRole()` endpoint
- `backend/routes/authRoutes.js` - POST `/api/auth/check-role`
- `backend/data/admins.json` - Admin emails
- `backend/data/doctors.json` - Doctor emails

## Important Notes

⚠️ **Email Must Match**: Clerk email MUST match email in JSON files
⚠️ **Active Status**: User must have `"active": true` in JSON
⚠️ **Backend Required**: Backend must be running for role checking

---

**Status**: ✅ Ready to use
