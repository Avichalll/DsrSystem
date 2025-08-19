// API service for backend communication
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';


const API_BASE_URL =  'http://localhost:8080/api';

// Helper method to make API calls
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }
  
  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication APIs
const authAPI = {
  async login(credentials) {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout() {
    return makeRequest('/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser() {
    return makeRequest('/auth/me');
  },
};

// DSR Visit APIs
const visitAPI = {
  async submitVisit(visitData) {
    return makeRequest('/visits', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
  },

  async getVisits(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return makeRequest(`/visits?${queryParams}`);
  },

  async getMyVisits(userId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return makeRequest(`/visits/user/${userId}?${queryParams}`);
  },

  async getVisitById(visitId) {
    return makeRequest(`/visits/${visitId}`);
  },

  async updateVisit(visitId, visitData) {
    return makeRequest(`/visits/${visitId}`, {
      method: 'PUT',
      body: JSON.stringify(visitData),
    });
  },

  async deleteVisit(visitId) {
    return makeRequest(`/visits/${visitId}`, {
      method: 'DELETE',
    });
  },
};

// Location APIs
const locationAPI = {
  async getLocations() {
    return makeRequest('/locations');
  },

  async addLocation(locationData) {
    return makeRequest('/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  },

  async getPendingLocations() {
    return makeRequest('/locations/pending');
  },

  async approveLocation(locationId) {
    return makeRequest(`/locations/${locationId}/approve`, {
      method: 'POST',
    });
  },
};

// User management APIs
const userAPI = {
  async getUsers() {
    return makeRequest('/users');
  },

  async createUser(userData) {
    return makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateUser(userId, userData) {
    return makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Analytics APIs
const analyticsAPI = {
  async getDashboardAnalytics(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return makeRequest(`/analytics/dashboard?${queryParams}`);
  },

  async getVisitStats(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return makeRequest(`/analytics/visit-stats?${queryParams}`);
  },

  async getLocationStats() {
    return makeRequest('/analytics/location-stats');
  },

  async getRepPerformance(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return makeRequest(`/analytics/rep-performance?${queryParams}`);
  },
};

// File and Export APIs
const fileAPI = {
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return makeRequest('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type header to let browser set it automatically for FormData
      },
    });
  },

  async exportVisits(filters = {}, format = 'csv') {
    const queryParams = new URLSearchParams({ ...filters, format }).toString();
    return makeRequest(`/exports/visits?${queryParams}`);
  },
};

// Main API service object
const apiService = {
  ...authAPI,
  ...visitAPI,
  ...locationAPI,
  ...userAPI,
  ...analyticsAPI,
  ...fileAPI,
};

// Export as default
export default apiService;