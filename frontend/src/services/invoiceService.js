import api from './api';

export const invoiceService = {
  async getAll(params) {
    const { data } = await api.get('/invoices', { params });
    return data;
  },

  async getMyOrders() {
    const { data } = await api.get('/invoices/my-orders');
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  },

  async create(invoiceData) {
    const { data } = await api.post('/invoices', invoiceData);
    return data;
  },

  async update(id, invoiceData) {
    const { data } = await api.put(`/invoices/${id}`, invoiceData);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/invoices/${id}`);
    return data;
  }
};
