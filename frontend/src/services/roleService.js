// Role verification service for Clerk authentication
// Path: frontend/src/services/roleService.js

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Check user's role based on their email in doctors.json or admins.json
 * @param {string} email - User's email from Clerk
 * @returns {Promise<Object>} - User role and data
 */
export const getUserRole = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to check role');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking role:', error);
    return { role: 'user', data: null }; // Default to user role
  }
};

/**
 * Sync Clerk user with backend data
 * @param {Object} clerkUser - Clerk user object
 * @returns {Promise<Object>} - Complete user data with role
 */
export const syncUserWithBackend = async (clerkUser) => {
  try {
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    console.log('🔍 Syncing user with backend:', email);
    
    if (!email) {
      console.log('⚠️ No email found, defaulting to user role');
      return {
        id: clerkUser.id,
        email: '',
        name: clerkUser.fullName,
        role: 'user',
      };
    }

    // Check if user is admin or doctor
    console.log('📡 Calling getUserRole API...');
    const roleData = await getUserRole(email);
    console.log('📥 Role data received:', roleData);

    if (roleData.success) {
      // Store in localStorage for quick access
      const userData = {
        id: clerkUser.id,
        email: email,
        name: roleData.user.name || clerkUser.fullName,
        role: roleData.user.role,
        ...roleData.user,
      };

      console.log('✅ User data prepared:', userData);
      localStorage.setItem('userRole', roleData.user.role);
      localStorage.setItem('userData', JSON.stringify(userData));

      return userData;
    }

    // Default to regular user if not found in admins or doctors
    console.log('ℹ️ No role found, defaulting to user');
    const defaultUser = {
      id: clerkUser.id,
      email: email,
      name: clerkUser.fullName,
      role: 'user',
    };

    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userData', JSON.stringify(defaultUser));

    return defaultUser;
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    return {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      name: clerkUser.fullName,
      role: 'user',
    };
  }
};

/**
 * Get stored user data from localStorage
 */
export const getStoredUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting stored user data:', error);
    return null;
  }
};

/**
 * Get dashboard path based on role
 */
export const getDashboardPath = (role) => {
  const paths = {
    admin: '/dashboard/admin',
    doctor: '/dashboard/doctor',
    user: '/dashboard/user',
  };

  return paths[role?.toLowerCase()] || '/dashboard';
};
