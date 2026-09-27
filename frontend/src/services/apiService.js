import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Determine the correct API URL based on environment
const getApiUrl = () => {
  // In production (Netlify), use the proxy via /api
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // In development, use localhost directly
  return process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
};

const API_BASE_URL = getApiUrl();

console.log('🚀 ========================================');
console.log('🚀 API Base URL:', API_BASE_URL);
console.log('🚀 Environment:', process.env.NODE_ENV);
console.log('🚀 ========================================');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      console.log('📤 Request:', {
        method: config.method.toUpperCase(),
        url: config.baseURL + config.url,
        hasUser: !!user
      });
      
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('❌ Auth error:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error Details:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default apiClient;