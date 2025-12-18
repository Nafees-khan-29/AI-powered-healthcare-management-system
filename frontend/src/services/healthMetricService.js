const API_URL = 'http://localhost:3000/api/health-metrics';

// Add new health metric
export const addHealthMetric = async (metricData) => {
  try {
    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metricData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add health metric');
    }

    return data;
  } catch (error) {
    console.error('Error adding health metric:', error);
    throw error;
  }
};

// Get user's health metrics
export const getUserHealthMetrics = async (userId, options = {}) => {
  try {
    const { limit = 30, startDate, endDate } = options;
    
    let url = `${API_URL}/user/${userId}?limit=${limit}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch health metrics');
    }

    return data;
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    throw error;
  }
};

// Get latest health metrics
export const getLatestHealthMetrics = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}/latest`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch latest metrics');
    }

    return data;
  } catch (error) {
    console.error('Error fetching latest metrics:', error);
    throw error;
  }
};

// Get health trends
export const getHealthTrends = async (userId, days = 30) => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}/trends?days=${days}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch health trends');
    }

    return data;
  } catch (error) {
    console.error('Error fetching health trends:', error);
    throw error;
  }
};

// Update health metric
export const updateHealthMetric = async (id, updateData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update health metric');
    }

    return data;
  } catch (error) {
    console.error('Error updating health metric:', error);
    throw error;
  }
};

// Delete health metric
export const deleteHealthMetric = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete health metric');
    }

    return data;
  } catch (error) {
    console.error('Error deleting health metric:', error);
    throw error;
  }
};
