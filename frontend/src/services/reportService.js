import apiClient from './apiService';

export const getGroupSummary = async (filters = {}) => {
  try {
    console.log('📊 Getting group summary with filters:', filters);
    const response = await apiClient.get('/reports/group-summary', { params: filters });
    console.log('✅ Group summary response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Group summary error:', error);
    return {
      totalMembers: 0,
      totalSavings: 0,
      totalWithdrawals: 0,
      netBalance: 0,
      recentActivity: [],
      error: 'Using fallback data'
    };
  }
};

export const getMemberReports = async (filters = {}) => {
  try {
    const response = await apiClient.get('/reports/members', { params: filters });
    return response.data;
  } catch (error) {
    console.error('❌ Member reports error:', error);
    return [];
  }
};

export const exportCSV = async (type, filters = {}) => {
  try {
    const response = await apiClient.get(`/reports/export/${type}`, {
      params: filters,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('❌ Export error:', error);
    throw error;
  }
};