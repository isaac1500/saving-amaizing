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

export const getGroupSummary = async (filters = {}) => {
  try {
    const response = await api.get('/reports/group-summary', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching group summary:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch group summary');
  }
};

export const getMemberReports = async (filters = {}) => {
  try {
    const response = await api.get('/reports/members', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching member reports:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch member reports');
  }
};

export const exportCSV = async (exportType, filters = {}) => {
  try {
    const response = await api.get(`/reports/export/${exportType}`, {
      params: filters,
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportType}-report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error(error.response?.data?.message || 'Failed to export data');
  }
};