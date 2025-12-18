const API_URL = 'http://localhost:3000/api/emergency-alerts';

// Create emergency alert
export const createEmergencyAlert = async (alertData) => {
  try {
    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alertData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send emergency alert');
    }

    return data;
  } catch (error) {
    console.error('Error creating emergency alert:', error);
    throw error;
  }
};

// Get patient's alerts
export const getPatientAlerts = async (patientId) => {
  try {
    const response = await fetch(`${API_URL}/patient/${patientId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch alerts');
    }

    return data;
  } catch (error) {
    console.error('Error fetching patient alerts:', error);
    throw error;
  }
};

// Get doctor's alerts
export const getDoctorAlerts = async (doctorId, status = null) => {
  try {
    let url = `${API_URL}/doctor/${doctorId}`;
    if (status) url += `?status=${status}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch alerts');
    }

    return data;
  } catch (error) {
    console.error('Error fetching doctor alerts:', error);
    throw error;
  }
};

// Get critical alerts
export const getCriticalAlerts = async () => {
  try {
    const response = await fetch(`${API_URL}/critical`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch critical alerts');
    }

    return data;
  } catch (error) {
    console.error('Error fetching critical alerts:', error);
    throw error;
  }
};

// Acknowledge alert
export const acknowledgeAlert = async (alertId, doctorId, doctorName) => {
  try {
    const response = await fetch(`${API_URL}/${alertId}/acknowledge`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ doctorId, doctorName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to acknowledge alert');
    }

    return data;
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    throw error;
  }
};

// Respond to alert
export const respondToAlert = async (alertId, doctorId, response) => {
  try {
    const responseData = await fetch(`${API_URL}/${alertId}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ doctorId, response })
    });

    const data = await responseData.json();

    if (!responseData.ok) {
      throw new Error(data.message || 'Failed to respond to alert');
    }

    return data;
  } catch (error) {
    console.error('Error responding to alert:', error);
    throw error;
  }
};

// Resolve alert
export const resolveAlert = async (alertId) => {
  try {
    const response = await fetch(`${API_URL}/${alertId}/resolve`, {
      method: 'PATCH'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resolve alert');
    }

    return data;
  } catch (error) {
    console.error('Error resolving alert:', error);
    throw error;
  }
};

export const deleteAlert = async (alertId) => {
  try {
    const response = await fetch(`${API_URL}/${alertId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete alert');
    }

    return data;
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};

export const sendVideoCallLink = async (alertId, videoCallLink, doctorName) => {
  try {
    const response = await fetch(`${API_URL}/send-video-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alertId,
        videoCallLink,
        doctorName
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send video call link');
    }

    return data;
  } catch (error) {
    console.error('Error sending video call link:', error);
    throw error;
  }
};
