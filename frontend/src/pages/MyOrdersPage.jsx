import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Calendar, CreditCard } from 'lucide-react';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/invoices/my-orders');
      setOrders(data.invoices);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-20">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order.invoiceNumber}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard size={16} />
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Items:</h4>
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.product?.pictureUrl && (
                          <img
                            src={item.product.pictureUrl}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-gray-600">
                            ${parseFloat(item.unitPrice).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        ${parseFloat(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
