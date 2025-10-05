// Frontend Integration Helper
// This file provides example API calls for frontend integration

const API_BASE_URL = 'http://localhost:5000/api';

// Authentication API calls
export const authAPI = {
  // Signup
  signup: async (email, role) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return response.json();
  },

  // Login
  login: async (email, role) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return response.json();
  },

  // Get profile
  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// Medicines API calls
export const medicinesAPI = {
  // Get all medicines
  getAll: async (token) => {
    const response = await fetch(`${API_BASE_URL}/medicines`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Get specific medicine
  getById: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Create medicine
  create: async (medicine, token) => {
    const response = await fetch(`${API_BASE_URL}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(medicine)
    });
    return response.json();
  },

  // Update medicine
  update: async (id, medicine, token) => {
    const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(medicine)
    });
    return response.json();
  },

  // Delete medicine
  delete: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// Doses API calls
export const dosesAPI = {
  // Get doses for date
  getByDate: async (date, token) => {
    const response = await fetch(`${API_BASE_URL}/doses/date/${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Get dose history
  getHistory: async (from, to, token, limit = 100) => {
    const params = new URLSearchParams({ from, to, limit });
    const response = await fetch(`${API_BASE_URL}/doses/history?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Update dose status
  updateStatus: async (doseId, status, token, timestamp = null) => {
    const response = await fetch(`${API_BASE_URL}/doses/${doseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, timestamp })
    });
    return response.json();
  },

  // Bulk update doses
  bulkUpdate: async (date, doses, token) => {
    const response = await fetch(`${API_BASE_URL}/doses/bulk/${date}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ doses })
    });
    return response.json();
  }
};

// Analytics API calls
export const analyticsAPI = {
  // Get adherence analytics
  getAdherence: async (from, to, token) => {
    const params = new URLSearchParams({ from, to });
    const response = await fetch(`${API_BASE_URL}/analytics/adherence?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Get medicine analytics
  getMedicineAnalytics: async (from, to, token) => {
    const params = new URLSearchParams({ from, to });
    const response = await fetch(`${API_BASE_URL}/analytics/medicines?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Get adherence summary
  getSummary: async (from, to, token) => {
    const params = new URLSearchParams({ from, to });
    const response = await fetch(`${API_BASE_URL}/analytics/summary?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Get trends
  getTrends: async (period = 'week', token) => {
    const params = new URLSearchParams({ period });
    const response = await fetch(`${API_BASE_URL}/analytics/trends?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// Utility functions
export const utils = {
  // Get today's date in YYYY-MM-DD format
  getToday: () => new Date().toISOString().slice(0, 10),

  // Get date range
  getDateRange: (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10)
    };
  },

  // Format time for display
  formatTime: (time) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  // Calculate adherence rate
  calculateAdherenceRate: (taken, total) => {
    if (total === 0) return 0;
    return Math.round((taken / total) * 100);
  }
};

// Example usage in React components:

/*
// In your AuthContext.jsx:
import { authAPI } from './path/to/frontend-integration.js';

const login = async (email, role) => {
  try {
    const result = await authAPI.login(email, role);
    if (result.token) {
      setUser({ ...result.user, token: result.token });
      localStorage.setItem('auth_token', result.token);
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// In your Dashboard.jsx:
import { dosesAPI, utils } from './path/to/frontend-integration.js';

const loadDoses = async () => {
  try {
    const today = utils.getToday();
    const result = await dosesAPI.getByDate(today, token);
    setDoses(result.doses);
  } catch (error) {
    console.error('Failed to load doses:', error);
  }
};

// In your Medicines.jsx:
import { medicinesAPI } from './path/to/frontend-integration.js';

const addMedicine = async (medicineData) => {
  try {
    const result = await medicinesAPI.create(medicineData, token);
    if (result.medicine) {
      setMedicines(prev => [...prev, result.medicine]);
    }
  } catch (error) {
    console.error('Failed to add medicine:', error);
  }
};
*/
