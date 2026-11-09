const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('nh_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An unexpected error occurred.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    getMe: () => request('/auth/me')
  },

  // Users
  users: {
    getProfile: () => request('/users/profile'),
    updateProfile: (profileData) => request('/users/profile', { method: 'PUT', body: profileData }),
    getPublicProfile: (id) => request(`/users/${id}/public`)
  },

  // Requests
  requests: {
    getRequests: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/requests${query ? `?${query}` : ''}`);
    },
    getRequestById: (id) => request(`/requests/${id}`),
    createRequest: (reqData) => request('/requests', { method: 'POST', body: reqData }),
    updateRequest: (id, reqData) => request(`/requests/${id}`, { method: 'PUT', body: reqData }),
    cancelRequest: (id) => request(`/requests/${id}`, { method: 'DELETE' }),
    updateStatus: (id, status) => request(`/requests/${id}/status`, { method: 'PUT', body: { status } }),
    getMyRequests: () => request('/requests/my'),
    volunteer: (id, message) => request(`/requests/${id}/volunteer`, { method: 'POST', body: { message } }),
    getOffers: (id) => request(`/requests/${id}/offers`),
    sendMessage: (id, message) => request(`/requests/${id}/messages`, { method: 'POST', body: { message } }),
    sendFeedback: (id, feedback) => request(`/requests/${id}/feedback`, { method: 'POST', body: feedback })
  },

  // Offers
  offers: {
    getMyOffers: () => request('/offers/my'),
    acceptOffer: (id) => request(`/offers/${id}/accept`, { method: 'PUT' }),
    rejectOffer: (id) => request(`/offers/${id}/reject`, { method: 'PUT' }),
    withdrawOffer: (id) => request(`/offers/${id}/withdraw`, { method: 'PUT' })
  },

  // Notifications
  notifications: {
    getNotifications: () => request('/notifications'),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: () => request('/notifications/read-all', { method: 'PUT' })
  },

  // Reports
  reports: {
    createReport: (reportData) => request('/reports', { method: 'POST', body: reportData })
  },

  // Admin
  admin: {
    getDashboard: () => request('/admin/dashboard'),
    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/users${query ? `?${query}` : ''}`);
    },
    updateUserStatus: (id, status) => request(`/admin/users/${id}/status`, { method: 'PUT', body: { status } }),
    getRequests: () => request('/admin/requests'),
    moderateRequest: (id, action) => request(`/admin/requests/${id}/moderate`, { method: 'PUT', body: { action } }),
    deleteRequest: (id) => request(`/admin/requests/${id}`, { method: 'DELETE' }),
    getReports: () => request('/admin/reports'),
    updateReport: (id, status) => request(`/admin/reports/${id}`, { method: 'PUT', body: { status } })
  }
};
