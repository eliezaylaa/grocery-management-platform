import api from './api';

export const receiptService = {
  downloadPDF: async (invoiceId) => {
    const response = await api.get(`/receipts/${invoiceId}/download`, {
      responseType: 'blob'
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  sendEmail: async (invoiceId, email = null) => {
    const response = await api.post(`/receipts/${invoiceId}/email`, { email });
    return response.data;
  }
};
