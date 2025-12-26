import React, { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';
import { receiptService } from '../services/receiptService';
import { Package, ShoppingBag, Clock, CheckCircle, XCircle, Download, Mail, Loader2, X, Eye, AlertCircle } from 'lucide-react';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [emailing, setEmailing] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);

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

  const handleDownloadPDF = async (orderId) => {
    setDownloading(orderId);
    try {
      await receiptService.downloadPDF(orderId);
    } catch (error) {
      alert('Failed to download receipt');
    } finally {
      setDownloading(null);
    }
  };

  const handleSendEmail = async (orderId) => {
    setEmailing(orderId);
    setEmailError(null);
    try {
      await receiptService.sendEmail(orderId);
      setEmailSuccess(orderId);
      setTimeout(() => setEmailSuccess(null), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send email';
      if (errorMsg.includes('Demo limitation') || errorMsg.includes('only send testing')) {
        setEmailError('Demo mode: Email only works for eliezaylaa@gmail.com. PDF download works for all!');
      } else {
        setEmailError(errorMsg);
      }
      setTimeout(() => setEmailError(null), 5000);
    } finally {
      setEmailing(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'pending': return <Clock className="text-orange-500" size={20} />;
      case 'failed': return <XCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">View your order history and download receipts</p>
      </div>

      {/* Email Error Banner */}
      {emailError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-amber-800 font-medium">Email Notice</p>
            <p className="text-amber-700 text-sm">{emailError}</p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-500">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      order.paymentStatus === 'completed' ? 'bg-green-100' :
                      order.paymentStatus === 'pending' ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(order.paymentStatus)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.invoiceNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(order.paymentStatus)}`}>
                          {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="text-2xl font-bold text-gray-900">€{parseFloat(order.totalAmount).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    
                    <button
                      onClick={() => handleDownloadPDF(order.id)}
                      disabled={downloading === order.id}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Download PDF"
                    >
                      {downloading === order.id ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Download size={20} />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleSendEmail(order.id)}
                      disabled={emailing === order.id}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        emailSuccess === order.id 
                          ? 'text-green-600 bg-green-50' 
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                      title={emailSuccess === order.id ? 'Sent!' : 'Email Receipt'}
                    >
                      {emailing === order.id ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : emailSuccess === order.id ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Mail size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 4).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          {item.product?.pictureUrl ? (
                            <img src={item.product.pictureUrl} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <Package size={14} className="text-gray-400" />
                            </div>
                          )}
                          <span className="text-sm text-gray-700">{item.product?.name?.substring(0, 20) || 'Product'}</span>
                          <span className="text-xs text-gray-500">×{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex items-center px-3 py-2 text-sm text-gray-500">
                          +{order.items.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onDownload={handleDownloadPDF}
          onEmail={handleSendEmail}
          downloading={downloading}
          emailing={emailing}
          emailSuccess={emailSuccess}
        />
      )}
    </div>
  );
};

// Order Detail Modal
const OrderDetailModal = ({ order, onClose, onDownload, onEmail, downloading, emailing, emailSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{order.invoiceNumber}</h2>
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Order Items */}
        <div className="p-6 border-b">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                {item.product?.pictureUrl ? (
                  <img src={item.product.pictureUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package size={24} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.product?.name || 'Product'}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × €{parseFloat(item.unitPrice).toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">€{parseFloat(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="p-6 border-b">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium capitalize">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Status</span>
            <span className={`font-medium capitalize ${
              order.paymentStatus === 'completed' ? 'text-green-600' :
              order.paymentStatus === 'pending' ? 'text-orange-600' : 'text-red-600'
            }`}>{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-4 border-t mt-4">
            <span>Total</span>
            <span>€{parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-3">
          <button
            onClick={() => onDownload(order.id)}
            disabled={downloading === order.id}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {downloading === order.id ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Download size={20} />
            )}
            Download PDF
          </button>
          <button
            onClick={() => onEmail(order.id)}
            disabled={emailing === order.id}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg disabled:opacity-50 ${
              emailSuccess === order.id
                ? 'bg-green-600 text-white'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {emailing === order.id ? (
              <Loader2 size={20} className="animate-spin" />
            ) : emailSuccess === order.id ? (
              <CheckCircle size={20} />
            ) : (
              <Mail size={20} />
            )}
            {emailSuccess === order.id ? 'Sent!' : 'Email Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};
