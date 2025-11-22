/**
 * Appointment Service
 * Frontend API integration for appointment management
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Create new appointment
export const createAppointment = async (appointmentData, files = null) => {
    try {
        let body;
        let headers = {};

        if (files && files.length > 0) {
            // Use FormData for file uploads
            const formData = new FormData();
            
            // Append all appointment data
            Object.keys(appointmentData).forEach(key => {
                formData.append(key, appointmentData[key]);
            });
            
            // Append files
            files.forEach(file => {
                formData.append('medicalReports', file);
            });
            
            body = formData;
            // Don't set Content-Type for FormData - browser will set it with boundary
        } else {
            // Regular JSON request
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(appointmentData);
        }

        const response = await fetch(`${API_BASE_URL}/appointments/create`, {
            method: 'POST',
            headers,
            body
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create appointment');
        }

        return data;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};

// Get user's appointments
export const getUserAppointments = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/user/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch appointments');
        }

        return data;
    } catch (error) {
        console.error('Error fetching user appointments:', error);
        throw error;
    }
};

// Get doctor's appointments
export const getDoctorAppointments = async (doctorId, filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/appointments/doctor/${doctorId}${queryParams ? `?${queryParams}` : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch appointments');
        }

        return data;
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        throw error;
    }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
    try {
        console.log('📞 updateAppointmentStatus called with:', { appointmentId, status });
        
        const url = `${API_BASE_URL}/appointments/${appointmentId}/status`;
        console.log('🌐 Making PUT request to:', url);
        console.log('📦 Request body:', { status });
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        const data = await response.json();
        console.log('📥 Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update appointment status');
        }

        return data;
    } catch (error) {
        console.error('❌ Error updating appointment status:', error);
        throw error;
    }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId, cancellationReason) => {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cancellationReason })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to cancel appointment');
        }

        return data;
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        throw error;
    }
};

// Get all appointments (admin)
export const getAllAppointments = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/appointments${queryParams ? `?${queryParams}` : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch appointments');
        }

        return data;
    } catch (error) {
        console.error('Error fetching all appointments:', error);
        throw error;
    }
};

// Get booked time slots for a doctor on a specific date
export const getBookedSlots = async (doctorEmail, date) => {
    try {
        const queryParams = new URLSearchParams({ doctorEmail, date }).toString();
        const url = `${API_BASE_URL}/appointments/booked-slots?${queryParams}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch booked slots');
        }

        return data;
    } catch (error) {
        console.error('Error fetching booked slots:', error);
        throw error;
    }
};
