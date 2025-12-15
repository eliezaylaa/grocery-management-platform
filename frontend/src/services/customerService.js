import api from './api';

export const customerService = {
  async getAll(params) {
    const { data } = await api.get('/customers', { params });
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  async create(customerData) {
    const { data } = await api.post('/customers', customerData);
    return data;
  },

  async update(id, customerData) {
    const { data } = await api.put(`/customers/${id}`, customerData);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/customers/${id}`);
    return data;
  }
};
