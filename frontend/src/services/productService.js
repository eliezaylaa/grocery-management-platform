import api from './api';

export const productService = {
  async getAll(params) {
    const { data } = await api.get('/products', { params });
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  async create(productData) {
    const { data } = await api.post('/products', productData);
    return data;
  },

  async update(id, productData) {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  async syncWithOpenFoodFacts(barcode) {
    const { data } = await api.post(`/products/sync/${barcode}`);
    return data;
  }
};
