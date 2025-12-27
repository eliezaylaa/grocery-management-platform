const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');

// PayPal Environment Setup
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;
  
  const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  
  return new paypal.core.PayPalHttpClient(environment);
}

// Get Stripe publishable key for frontend
exports.getStripeKey = async (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
};

// Create Stripe Payment Intent
exports.createStripePaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'eur' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency,
      metadata: {
        userId: req.user.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Confirm Stripe Payment
exports.confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({ 
        success: true, 
        status: paymentIntent.status,
        paymentId: paymentIntent.id
      });
    } else {
      res.json({ 
        success: false, 
        status: paymentIntent.status 
      });
    }
  } catch (error) {
    console.error('Stripe confirm error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create PayPal Order
exports.createPayPalOrder = async (req, res) => {
  try {
    const { amount, currency = 'EUR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: 'Trinity Grocery Purchase'
      }]
    });

    const order = await client.execute(request);
    
    res.json({
      orderId: order.result.id,
      status: order.result.status
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Capture PayPal Order (after user approves)
exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID required' });
    }

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);

    res.json({
      success: capture.result.status === 'COMPLETED',
      status: capture.result.status,
      paymentId: capture.result.id,
      captureId: capture.result.purchase_units[0]?.payments?.captures[0]?.id
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get PayPal Client ID for frontend
exports.getPayPalClientId = async (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
};
