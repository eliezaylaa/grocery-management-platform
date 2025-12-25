import api from './api';

export const invoiceService = {
  getAll: async (params = {}) => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/invoices/my-orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  }
};
