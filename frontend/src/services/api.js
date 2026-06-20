import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sparkle_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sparkle_token');
      localStorage.removeItem('sparkle_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Orders
export const orderAPI = {
  getOrders: (params) => API.get('/orders', { params }),
  getOrder: (id) => API.get(`/orders/${id}`),
  createOrder: (data) => API.post('/orders', data),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  uploadPaymentProof: (id, formData) => API.post(`/orders/${id}/payment-proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verifyPayment: (id, data) => API.post(`/orders/${id}/verify-payment`, data),
  track: (tagId) => API.get(`/track/${tagId}`),
};

// Customers
export const customerAPI = {
  getCustomers: (params) => API.get('/customers', { params }),
  getCustomer: (id) => API.get(`/customers/${id}`),
  createCustomer: (data) => API.post('/customers', data),
};

// Staff
export const staffAPI = {
  getStaff: () => API.get('/staff'),
  createStaff: (data) => API.post('/staff', data),
  updateStaff: (id, data) => API.put(`/staff/${id}`, data),
};

// Garments
export const garmentAPI = {
  uploadPhotos: (orderId, garmentIndex, formData) =>
    API.post(`/garments/${orderId}/${garmentIndex}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCondition: (orderId, garmentIndex, data) =>
    API.put(`/garments/${orderId}/${garmentIndex}/condition`, data),
  deletePhoto: (orderId, garmentIndex, photoIndex) =>
    API.delete(`/garments/${orderId}/${garmentIndex}/photos/${photoIndex}`),
};

// Invoices
export const invoiceAPI = {
  getInvoices: () => API.get('/invoices'),
  generate: (orderId) => API.post(`/invoices/generate/${orderId}`),
  downloadUrl: (id) => `${import.meta.env.VITE_API_URL || '/api'}/invoices/${id}/download`,
};

// Notifications
export const notificationAPI = {
  getNotifications: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
  getCustomerStats: () => API.get('/analytics/customer'),
};

export default API;
