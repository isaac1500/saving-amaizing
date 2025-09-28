// apiService.js - Enhanced API service with better error handling
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔄 API Request:', {
      url: config.url,
      method: config.method.toUpperCase(),
      hasToken: !!token,
      hasUser: !!user
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No authentication token found for API request');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Attempting token refresh...');
      
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const newToken = refreshResponse.data.accessToken;
        localStorage.setItem('token', newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Dispatch custom event for auth failure
        window.dispatchEvent(new CustomEvent('auth-failure'));
        
        return Promise.reject(new Error('Authentication failed. Please log in again.'));
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An unexpected error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

// API methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    refresh: () => apiClient.post('/auth/refresh'),
    logout: () => apiClient.post('/auth/logout'),
  },
  
  // Members endpoints
  members: {
    getAll: (params = {}) => apiClient.get('/members', { params }),
    getById: (id) => apiClient.get(`/members/${id}`),
    create: (memberData) => apiClient.post('/members', memberData),
    update: (id, memberData) => apiClient.put(`/members/${id}`, memberData),
    delete: (id) => apiClient.delete(`/members/${id}`),
  },
  
  // Transactions endpoints
  transactions: {
    getAll: (params = {}) => apiClient.get('/transactions', { params }),
    getById: (id) => apiClient.get(`/transactions/${id}`),
    create: (transactionData) => apiClient.post('/transactions', transactionData),
    update: (id, transactionData) => apiClient.put(`/transactions/${id}`, transactionData),
    delete: (id) => apiClient.delete(`/transactions/${id}`),
  },
  
  // Reports endpoints
  reports: {
    getMemberReports: (params = {}) => apiClient.get('/reports/members', { params }),
    getTransactionReports: (params = {}) => apiClient.get('/reports/transactions', { params }),
    getGroupSummary: (params = {}) => apiClient.get('/reports/group-summary', { params }),
    exportCSV: (type, params = {}) => apiClient.get(`/reports/export/${type}`, { 
      params,
      responseType: 'blob'
    }),
  },
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return false;
  }
  
  try {
    // Check token expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      console.log('🔄 Token is expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking token:', error);
    return false;
  }
};

// Listen for auth failure events
window.addEventListener('auth-failure', () => {
  console.log('🔄 Auth failure detected, redirecting to login...');
  // Redirect to login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
});

export default apiClient;