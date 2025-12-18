/**
 * User Service
 * Frontend API integration for user management
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Get user details by email
 */
export const getUserByEmail = async (email) => {
    try {
        if (!email || email === 'N/A') {
            return null;
        }

        const response = await fetch(`${API_BASE_URL}/auth/user/${encodeURIComponent(email)}`);
        const data = await response.json();

        if (!response.ok) {
            console.warn('User not found:', email);
            return null;
        }

        return data.user;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return null;
    }
};
