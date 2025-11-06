// Authentication utility for role-based routing
// Import this in your login components

/**
 * Role-based redirect after successful login
 * @param {Object} user - User object from authentication
 * @param {string} user.role - User role: 'user', 'doctor', or 'admin'
 * @param {Function} navigate - React Router navigate function
 */
export const redirectToDashboard = (user, navigate) => {
  if (!user || !user.role) {
    console.error('User or role is undefined');
    return;
  }

  const role = user.role.toLowerCase();

  switch (role) {
    case 'user':
      navigate('/userDashboard');
      break;
    case 'doctor':
      navigate('/doctorDashboard');
      break;
    case 'admin':
      navigate('/adminDashboard');
      break;
    default:
      console.error('Unknown role:', role);
      navigate('/dashboard'); // Fallback to generic dashboard
  }
};

/**
 * Check user role and return boolean
 * @param {Object} user - User object
 * @param {string} requiredRole - Required role to check
 * @returns {boolean}
 */
export const checkUserRole = (user, requiredRole) => {
  if (!user || !user.role) return false;
  return user.role.toLowerCase() === requiredRole.toLowerCase();
};

/**
 * Get dashboard path based on role
 * @param {string} role - User role
 * @returns {string} - Dashboard path
 */
export const getDashboardPath = (role) => {
  const rolePaths = {
    user: '/userDashboard',
    doctor: '/doctorDashboard',
    admin: '/adminDashboard',
  };

  return rolePaths[role.toLowerCase()] || '/dashboard';
};

/**
 * Protect routes based on user role
 * @param {Object} user - Current user object
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
export const isAuthorized = (user, allowedRoles = []) => {
  if (!user || !user.role) return false;
  if (allowedRoles.length === 0) return true; // No restriction
  
  return allowedRoles.some(
    (role) => role.toLowerCase() === user.role.toLowerCase()
  );
};

/**
 * Example login handler with role checking
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Function} navigate - React Router navigate function
 */
export const handleLoginWithRole = async (email, password, navigate) => {
  try {
    // This is where you'd make your API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const user = await response.json();

    // Store user data in localStorage or session
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token);

    // Redirect based on role
    redirectToDashboard(user, navigate);

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get stored user from localStorage
 * @returns {Object|null}
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

/**
 * Logout user and clear storage
 * @param {Function} navigate - React Router navigate function
 */
export const logoutUser = (navigate) => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  navigate('/login');
};
