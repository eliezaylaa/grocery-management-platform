import api from './api';

export const reportService = {
  async getKPIs() {
    const { data } = await api.get('/reports/kpis');
    return data;
  },

  async getSalesReport(days) {
    const { data } = await api.get('/reports/sales', { params: { days } });
    return data;
  }
};
