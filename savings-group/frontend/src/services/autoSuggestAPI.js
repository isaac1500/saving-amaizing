import axios from 'axios';
import { auth } from './firebase'; // Import the auth object directly

const API_URL = process.env.REACT_APP_NODE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const searchMembers = async (query, filters = {}) => {
  try {
    const response = await api.get('/suggestions/members', {
      params: { q: query, ...filters }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    // Return empty array instead of throwing error for better UX
    return [];
  }
};

export const getMemberSuggestions = async (query, limit = 10) => {
  try {
    const response = await api.get('/suggestions/members', {
      params: { q: query, limit }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};