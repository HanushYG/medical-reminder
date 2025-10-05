const API_BASE = 'http://localhost:5000/api';

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Helper function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
}

// Medicine API functions
export const medicineAPI = {
  // Get all medicines
  async getAll() {
    return apiRequest('/medicines');
  },

  // Get a specific medicine
  async getById(id) {
    return apiRequest(`/medicines/${id}`);
  },

  // Create a new medicine
  async create(medicine) {
    return apiRequest('/medicines', {
      method: 'POST',
      body: JSON.stringify(medicine),
    });
  },

  // Update a medicine
  async update(id, medicine) {
    return apiRequest(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicine),
    });
  },

  // Delete a medicine
  async delete(id) {
    return apiRequest(`/medicines/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dose API functions
export const doseAPI = {
  // Get doses for a specific date
  async getByDate(date) {
    return apiRequest(`/doses/date/${date}`);
  },

  // Update dose status
  async updateStatus(doseId, status, timestamp) {
    return apiRequest(`/doses/${doseId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, timestamp }),
    });
  },

  // Bulk update doses
  async bulkUpdate(date, doses) {
    return apiRequest(`/doses/bulk/${date}`, {
      method: 'PUT',
      body: JSON.stringify({ doses }),
    });
  },
};

// Analytics API functions
export const analyticsAPI = {
  // Get adherence statistics
  async getAdherence(startDate, endDate) {
    return apiRequest(`/analytics/adherence?from=${startDate}&to=${endDate}`);
  },

  // Get dose history
  async getDoseHistory(startDate, endDate, limit = 100) {
    return apiRequest(`/doses/history?from=${startDate}&to=${endDate}&limit=${limit}`);
  },
};

// Legacy compatibility - replace localStorage functions
export function loadData() {
  // This will be replaced by the actual API calls
  return { medicines: [], doses: [] };
}

export function saveData(data) {
  // This will be replaced by the actual API calls
  console.log('saveData called with:', data);
}

