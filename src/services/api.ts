import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.metll.in/api';

// Create axios instance with auth interceptor
export const api = axios.create({
  baseURL: API_URL,
});

// Intercept requests to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AdminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (page = 1, limit = 50) => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  updateUser: async (userId: number, data: any) => {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  getTickets: async () => {
    const response = await api.get('/admin/tickets');
    return response.data;
  },

  updateTicket: async (ticketId: number, data: any) => {
    const response = await api.put(`/admin/tickets/${ticketId}`, data);
    return response.data;
  },

  getMatches: async () => {
    const response = await api.get('/admin/matches');
    return response.data;
  },

  bulkSendEmail: async (formData: FormData) => {
    const response = await api.post('/admin/bulk-email', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createProfile: async (formData: FormData) => {
    const response = await api.post('/admin/profiles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFeedbacks: async () => {
    const response = await api.get('/admin/feedbacks');
    return response.data;
  },

  getJobs: async () => {
    const response = await api.get('/admin/jobs');
    return response.data;
  },

  createJob: async (data: any) => {
    const response = await api.post('/admin/jobs', data);
    return response.data;
  },

  deleteJob: async (jobId: number) => {
    const response = await api.delete(`/admin/jobs/${jobId}`);
    return response.data;
  },

  getJobApplications: async (jobId: number) => {
    const response = await api.get(`/admin/jobs/${jobId}/applications`);
    return response.data;
  },

  // ── Push Notification Broadcasts ──────────────────────────────────────────

  getBroadcastStats: async () => {
    const response = await api.get('/admin/notifications/stats');
    return response.data;
  },

  getBroadcasts: async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/notifications/broadcasts?page=${page}&limit=${limit}`);
    return response.data;
  },

  getBroadcastById: async (id: number) => {
    const response = await api.get(`/admin/notifications/broadcasts/${id}`);
    return response.data;
  },

  getUserCount: async (targetType: string, targetUserIds?: number[], filters?: Record<string, any>) => {
    let url = `/admin/notifications/user-count?targetType=${targetType}`;
    if (targetUserIds && targetUserIds.length > 0) url += `&targetUserIds=${targetUserIds.join(',')}`;
    if (filters) url += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    const response = await api.get(url);
    return response.data;
  },

  sendBroadcast: async (payload: {
    title: string;
    body: string;
    imageUrl?: string;
    deepLink?: string;
    data?: Record<string, string>;
    priority?: string;
    targetType: 'all' | 'specific' | 'filtered';
    targetUserIds?: number[];
    filters?: Record<string, any>;
  }) => {
    const response = await api.post('/admin/notifications/broadcast', payload);
    return response.data;
  },
};

