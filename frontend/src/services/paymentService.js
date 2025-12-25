import api from './api';

export const paymentService = {
  // Stripe
  getStripeKey: async () => {
    const response = await api.get('/payments/stripe/key');
    return response.data;
  },

  createStripePaymentIntent: async (amount, currency = 'eur') => {
    const response = await api.post('/payments/stripe/create-payment-intent', { amount, currency });
    return response.data;
  },

  confirmStripePayment: async (paymentIntentId) => {
    const response = await api.post('/payments/stripe/confirm', { paymentIntentId });
    return response.data;
  },

  // PayPal
  getPayPalClientId: async () => {
    const response = await api.get('/payments/paypal/client-id');
    return response.data;
  },

  createPayPalOrder: async (amount, currency = 'EUR') => {
    const response = await api.post('/payments/paypal/create-order', { amount, currency });
    return response.data;
  },

  capturePayPalOrder: async (orderId) => {
    const response = await api.post('/payments/paypal/capture-order', { orderId });
    return response.data;
  }
};
