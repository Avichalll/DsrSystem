import api from './api';

// Authentication API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// Visit/DSR API calls
export const visitAPI = {
  // Create new visit
  createVisit: async (visitData) => {
    const response = await api.post('/visits', visitData);
    return response.data;
  },

  // Get visits with filters
  getVisits: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/visits?${params}`);
    return response.data;
  },

  // Get visits by user ID
  getVisitsByUser: async (userId, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/visits/user/${userId}?${params}`);
    return response.data;
  },

  // Get visit by ID
  getVisitById: async (visitId) => {
    const response = await api.get(`/visits/${visitId}`);
    return response.data;
  },

  // Update visit
  updateVisit: async (visitId, visitData) => {
    const response = await api.put(`/visits/${visitId}`, visitData);
    return response.data;
  },

  // Delete visit
  deleteVisit: async (visitId) => {
    const response = await api.delete(`/visits/${visitId}`);
    return response.data;
  },

  // Upload files
  uploadFile: async (file, visitId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visitId', visitId);
    
    const response = await api.post('/visits/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Location API calls
export const locationAPI = {
  // Get all locations
  getLocations: async () => {
    const response = await api.get('/locations');
    return response.data;
  },

  // Get pending locations
  getPendingLocations: async () => {
    const response = await api.get('/locations/pending');
    return response.data;
  },

  // Approve location
  approveLocation: async (locationId) => {
    const response = await api.post(`/locations/${locationId}/approve`);
    return response.data;
  },

  // Create new location
  createLocation: async (locationData) => {
    const response = await api.post('/locations', locationData);
    return response.data;
  },

  // Update location
  updateLocation: async (locationId, locationData) => {
    const response = await api.put(`/locations/${locationId}`, locationData);
    return response.data;
  }
};

// User API calls
export const userAPI = {
  // Get all users
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};

// Analytics API calls
export const analyticsAPI = {
  // Get dashboard analytics
  getDashboardAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/analytics/dashboard?${params}`);
    return response.data;
  },

  // Get visit analytics
  getVisitAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/analytics/visits?${params}`);
    return response.data;
  },

  // Get rep performance
  getRepPerformance: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/analytics/performance?${params}`);
    return response.data;
  },

  // Export data
  exportData: async (filters = {}, format = 'csv') => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    params.append('format', format);
    
    const response = await api.get(`/analytics/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
