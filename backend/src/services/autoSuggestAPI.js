import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_NODE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Request interceptor to automatically add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return config; // Continue without token if there's an error
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 errors specifically
    if (error.response?.status === 401) {
      // You might want to redirect to login or show a message
      console.error('Authentication failed. Please log in again.');
    }
    
    return Promise.reject(error);
  }
);

export const getMemberSuggestions = async (query) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    
    const response = await api.get('/api/suggestions/members', {
      params: { q: query }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    // Return empty array instead of throwing to prevent UI breakage
    return [];
  }
};

export default api;