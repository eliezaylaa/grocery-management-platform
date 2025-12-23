import React, { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await invoiceService.getMyOrders();
      setOrders(data.invoices || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-orange-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      case 'refunded':
        return <AlertCircle className="text-blue-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      card: '💳 Card',
      cash: '💵 Cash',
      paypal: '🅿️ PayPal'
    };
    return labels[method] || method;
  };

  if (loading) {
    return <div className="text-center py-20">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No orders yet</h2>
        <p className="text-gray-500">Start shopping to see your orders here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">View your order history</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-lg">{order.invoiceNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.paymentStatus)}`}>
                  {getStatusIcon(order.paymentStatus)}
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4">
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.product?.pictureUrl ? (
                      <img src={item.product.pictureUrl} alt={item.product?.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name || 'Product'}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}</p>
                    </div>
                    <p className="font-semibold">${parseFloat(item.subtotal).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              {order.paymentStatus === 'pending' && order.paymentMethod === 'cash' && (
                <p className="text-sm text-orange-600">
                  ⏳ Waiting for manager approval
                </p>
              )}
              {order.paymentStatus === 'completed' && (
                <p className="text-sm text-green-600">
                  ✓ Payment confirmed
                </p>
              )}
              {order.paymentStatus !== 'pending' && order.paymentStatus !== 'completed' && (
                <span></span>
              )}
              <p className="text-xl font-bold">
                Total: ${parseFloat(order.totalAmount).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
