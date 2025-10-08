import api from './api';

// Dashboard API
const dashboardAPI = {
  // Get user dashboard data
  getUserDashboard: () => {
    return api.get('/auth/dashboard/');
  },

  // Get system dashboard data (admin only)
  getSystemDashboard: () => {
    return api.get('/auth/dashboard/system/');
  }
};

export default dashboardAPI;