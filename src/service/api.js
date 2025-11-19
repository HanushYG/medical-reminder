// API Configuration
const API_BASE = 'http://localhost:5002/api';

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Helper function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  };

  console.log(`Making ${config.method} request to ${endpoint}`);

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg = error.error || 'API request failed';
    
    // Signal auth issues clearly
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    
    throw new Error(msg);
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

// Doctor API functions
export const doctorAPI = {
  // Get all patients
  async getAllPatients() {
    return apiRequest('/doctor/patients');
  },

  // Get specific patient details
  async getPatient(patientId) {
    return apiRequest(`/doctor/patients/${patientId}`);
  },

  // Get patient's medicines
  async getPatientMedicines(patientId) {
    return apiRequest(`/doctor/patients/${patientId}/medicines`);
  },

  // Get patient's dose history
  async getPatientDoses(patientId, from, to, limit = 50) {
    let url = `/doctor/patients/${patientId}/doses?limit=${limit}`;
    if (from && to) {
      url += `&from=${from}&to=${to}`;
    }
    return apiRequest(url);
  },

  // Get patient's adherence statistics
  async getPatientAdherence(patientId, from, to) {
    return apiRequest(`/doctor/patients/${patientId}/adherence?from=${from}&to=${to}`);
  },

  // Get aggregated analytics for all patients
  async getAllPatientsAnalytics(from, to) {
    return apiRequest(`/doctor/analytics/all-patients?from=${from}&to=${to}`);
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


