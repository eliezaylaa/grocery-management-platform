import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { paymentService } from '../services/paymentService';
import { invoiceService } from '../services/invoiceService';
import { ShoppingCart, CreditCard, Truck, CheckCircle, AlertCircle, Loader2, ArrowLeft, Clock } from 'lucide-react';

// Stripe Card Form Component
const StripeCardForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { clientSecret } = await paymentService.createStripePaymentIntent(amount);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        onError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess({ paymentId: paymentIntent.id, method: 'card' });
      }
    } catch (err) {
      setError(err.message);
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        {processing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Pay €{amount.toFixed(2)}
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Test card: 4242 4242 4242 4242 | Any future date | Any CVC
      </p>
    </form>
  );
};

// Main Checkout Page
export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stripePromise, setStripePromise] = useState(null);
  const [paypalClientId, setPaypalClientId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCart();
    loadPaymentKeys();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const loadPaymentKeys = async () => {
    try {
      const { publishableKey } = await paymentService.getStripeKey();
      setStripePromise(loadStripe(publishableKey));

      const { clientId } = await paymentService.getPayPalClientId();
      setPaypalClientId(clientId);
    } catch (err) {
      console.error('Failed to load payment keys:', err);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const tax = subtotal * 0.20;
  const total = subtotal + tax;

  const createOrder = async (paymentId, method) => {
    try {
      setProcessing(true);
      
      // Cash payments are PENDING until manager approves
      // Card and PayPal payments are COMPLETED immediately
      const paymentStatus = method === 'cash' ? 'pending' : 'completed';
      
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        paymentMethod: method,
        paymentStatus: paymentStatus,
        paypalTransactionId: method === 'paypal' ? paymentId : null
      };

      const response = await invoiceService.create(orderData);
      
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      setOrderDetails({ ...response.invoice, paymentMethod: method });
      setOrderComplete(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async ({ paymentId, method }) => {
    await createOrder(paymentId, method);
  };

  const handlePaymentError = (message) => {
    setError(message);
  };

  const handleCashPayment = async () => {
    await createOrder(null, 'cash');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (orderComplete) {
    const isCashPayment = orderDetails?.paymentMethod === 'cash';
    
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className={`w-20 h-20 ${isCashPayment ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {isCashPayment ? (
            <Clock size={40} className="text-yellow-600" />
          ) : (
            <CheckCircle size={40} className="text-green-600" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isCashPayment ? 'Order Placed!' : 'Order Complete!'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isCashPayment 
            ? `Your order #${orderDetails?.invoiceNumber} has been placed. Payment is pending manager/employee approval.`
            : `Thank you for your purchase. Your order #${orderDetails?.invoiceNumber} has been confirmed.`
          }
        </p>
        
        {isCashPayment && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Cash Payment Pending</p>
                <p className="text-sm text-yellow-700 mt-1">
                  A manager or employee will confirm your payment when you pay in cash upon delivery or pickup.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Order Number:</span>
              <span className="font-medium">{orderDetails?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">€{parseFloat(orderDetails?.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-medium capitalize">{orderDetails?.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium capitalize ${
                orderDetails?.paymentStatus === 'completed' ? 'text-green-600' : 
                orderDetails?.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {orderDetails?.paymentStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/shop')}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/my-orders')}
            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to your cart to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Cart
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart size={24} />
            Order Summary
          </h2>
          
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                {item.pictureUrl ? (
                  <img src={item.pictureUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <ShoppingCart size={24} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>VAT (20%)</span>
              <span>€{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={24} />
            Payment Method
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Payment Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard size={24} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                paymentMethod === 'paypal'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.65h6.406c2.638 0 4.553.566 5.726 1.683.584.557.987 1.2 1.2 1.913.225.752.27 1.645.137 2.658-.014.1-.03.197-.048.296l-.004.02v.263l.206.115c.173.09.33.195.47.315.314.27.557.612.716 1.013.162.408.254.892.266 1.438.01.55-.052 1.16-.2 1.816a6.74 6.74 0 0 1-.736 1.87 4.52 4.52 0 0 1-1.166 1.33c-.468.354-1.013.626-1.62.812-.598.183-1.268.275-1.994.275h-.473a1.29 1.29 0 0 0-1.275 1.09l-.037.19-.56 3.562-.028.137a.215.215 0 0 1-.212.18h-3.63z"/>
              </svg>
              <span className="text-sm font-medium">PayPal</span>
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                paymentMethod === 'cash'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Truck size={24} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Cash</span>
            </button>
          </div>

          {/* Card Payment - Stripe */}
          {paymentMethod === 'card' && stripePromise && (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                amount={total}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}

          {/* PayPal Payment - Only PayPal account, NO card option */}
          {paymentMethod === 'paypal' && paypalClientId && (
            <PayPalScriptProvider 
              options={{ 
                'client-id': paypalClientId, 
                currency: 'EUR',
                'disable-funding': 'card,credit,paylater,venmo,sepa,bancontact,eps,giropay,ideal,mybank,p24,sofort'
              }}
            >
              <PayPalButtons
                style={{ 
                  layout: 'vertical', 
                  color: 'gold', 
                  shape: 'rect', 
                  label: 'paypal',
                  height: 45
                }}
                fundingSource="paypal"
                createOrder={async () => {
                  const { orderId } = await paymentService.createPayPalOrder(total, 'EUR');
                  return orderId;
                }}
                onApprove={async (data) => {
                  const { success, paymentId } = await paymentService.capturePayPalOrder(data.orderID);
                  if (success) {
                    handlePaymentSuccess({ paymentId, method: 'paypal' });
                  } else {
                    handlePaymentError('PayPal payment failed');
                  }
                }}
                onError={(err) => {
                  handlePaymentError('PayPal error: ' + err.message);
                }}
              />
              <p className="text-xs text-gray-500 text-center mt-3">
                Pay securely with your PayPal account
              </p>
            </PayPalScriptProvider>
          )}

          {/* Cash Payment */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Pay on Delivery / Pickup</p>
                    <p className="mt-1">You will pay €{total.toFixed(2)} in cash when your order is delivered or picked up.</p>
                    <p className="mt-2 text-yellow-700">⚠️ Your order will be <strong>pending</strong> until a manager or employee confirms the cash payment.</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCashPayment}
                disabled={processing}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-medium"
              >
                {processing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Truck size={20} />
                    Place Order (Pay on Delivery)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security Note */}
          <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
            <p>🔒 Payments are secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};
