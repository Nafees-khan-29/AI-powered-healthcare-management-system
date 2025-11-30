/**
 * Medical Records Service
 * Frontend API integration for medical records and prescriptions management
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Create new medical record
export const createMedicalRecord = async (recordData) => {
    try {
        console.log('Sending medical record data:', recordData);
        console.log('Data types:', {
            patientName: typeof recordData.patientName,
            doctorEmail: typeof recordData.doctorEmail,
            date: typeof recordData.date,
            diagnosis: typeof recordData.diagnosis
        });

        const response = await fetch(`${API_BASE_URL}/medical-records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recordData)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend response:', data);
            throw new Error(data.message || 'Failed to create medical record');
        }

        return data;
    } catch (error) {
        console.error('Error creating medical record:', error);
        throw error;
    }
};

// Get medical records for a patient
export const getPatientMedicalRecords = async (patientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch medical records');
        }

        return data;
    } catch (error) {
        console.error('Error fetching patient medical records:', error);
        throw error;
    }
};

// Get medical records for a doctor
export const getDoctorMedicalRecords = async (doctorId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-records/doctor/${doctorId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch medical records');
        }

        return data;
    } catch (error) {
        console.error('Error fetching doctor medical records:', error);
        throw error;
    }
};

// Update medical record
export const updateMedicalRecord = async (recordId, recordData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recordData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update medical record');
        }

        return data;
    } catch (error) {
        console.error('Error updating medical record:', error);
        throw error;
    }
};

// Delete medical record
export const deleteMedicalRecord = async (recordId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete medical record');
        }

        return data;
    } catch (error) {
        console.error('Error deleting medical record:', error);
        throw error;
    }
};

// Create new prescription
export const createPrescription = async (prescriptionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/prescriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prescriptionData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create prescription');
        }

        return data;
    } catch (error) {
        console.error('Error creating prescription:', error);
        throw error;
    }
};

// Get prescriptions for a patient
export const getPatientPrescriptions = async (patientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/prescriptions/patient/${patientId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch prescriptions');
        }

        return data;
    } catch (error) {
        console.error('Error fetching patient prescriptions:', error);
        throw error;
    }
};

// Get prescriptions for a doctor
export const getDoctorPrescriptions = async (doctorId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/prescriptions/doctor/${doctorId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch prescriptions');
        }

        return data;
    } catch (error) {
        console.error('Error fetching doctor prescriptions:', error);
        throw error;
    }
};

// Update prescription
export const updatePrescription = async (prescriptionId, prescriptionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prescriptionData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update prescription');
        }

        return data;
    } catch (error) {
        console.error('Error updating prescription:', error);
        throw error;
    }
};

// Delete prescription
export const deletePrescription = async (prescriptionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete prescription');
        }

        return data;
    } catch (error) {
        console.error('Error deleting prescription:', error);
        throw error;
    }
};