/**
 * Doctor Service
 * Frontend API integration for doctor management
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Get all doctors
export const getAllDoctors = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/doctors${queryParams ? `?${queryParams}` : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch doctors');
        }

        return data;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
};

// Get doctor by ID
export const getDoctorById = async (doctorId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch doctor');
        }

        return data;
    } catch (error) {
        console.error('Error fetching doctor:', error);
        throw error;
    }
};

// Add new doctor (admin only)
export const addDoctor = async (doctorData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doctorData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add doctor');
        }

        return data;
    } catch (error) {
        console.error('Error adding doctor:', error);
        throw error;
    }
};

// Update doctor information
export const updateDoctor = async (doctorId, updateData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update doctor');
        }

        return data;
    } catch (error) {
        console.error('Error updating doctor:', error);
        throw error;
    }
};

// Delete doctor
export const deleteDoctor = async (doctorId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete doctor');
        }

        return data;
    } catch (error) {
        console.error('Error deleting doctor:', error);
        throw error;
    }
};

// Toggle doctor availability
export const toggleDoctorAvailability = async (doctorId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/availability`, {
            method: 'PUT'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to toggle availability');
        }

        return data;
    } catch (error) {
        console.error('Error toggling availability:', error);
        throw error;
    }
};
