import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Use environment variable for API URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:3002/api');

console.log('🔍 AutoSuggest API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('🔍 AutoSuggest Request:', config.baseURL + config.url);
      return config;
    } catch (error) {
      console.error('❌ AutoSuggest Auth error:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ AutoSuggest Response:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ AutoSuggest API Error:', error.message);
    return Promise.reject(error);
  }
);

// ✅ Main function to get suggestions
export const getSuggestions = async (query, type = 'members') => {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    
    console.log(`🔍 Fetching suggestions for: ${query}`);
    const response = await api.get(`/suggestions/${type}?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('💥 Error fetching suggestions:', error.message);
    return [];
  }
};

// ✅ ADD THIS - Alias for getSuggestions with default type
export const getMemberSuggestions = async (query) => {
  return getSuggestions(query, 'members');
};

// ✅ ADD THIS - For backward compatibility
export const getAutoSuggestions = async (query, type = 'members') => {
  return getSuggestions(query, type);
};

export default { 
  getSuggestions, 
  getMemberSuggestions, 
  getAutoSuggestions 
};