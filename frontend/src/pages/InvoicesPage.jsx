import React, { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, Package, CreditCard, Banknote, X } from 'lucide-react';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await invoiceService.getAll();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      await invoiceService.update(invoiceId, { paymentStatus: newStatus });
      loadInvoices();
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, paymentStatus: newStatus });
      }
      alert(`Order ${newStatus === 'completed' ? 'approved' : 'updated'} successfully!`);
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'pending': return <Clock className="text-orange-500" size={20} />;
      case 'failed': return <XCircle className="text-red-500" size={20} />;
      case 'refunded': return <AlertCircle className="text-blue-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
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

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'card': return <CreditCard size={16} />;
      case 'cash': return <Banknote size={16} />;
      case 'paypal': return <span className="text-xs font-bold">PP</span>;
      default: return null;
    }
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.paymentStatus === filter);

  const pendingCount = invoices.filter(inv => inv.paymentStatus === 'pending').length;

  if (loading) {
    return <div className="text-center py-20">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-2">Manage orders and approve pending payments</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <Clock size={20} />
            <span className="font-semibold">{pendingCount} pending approval</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          All ({invoices.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          <Clock size={16} />
          Pending ({invoices.filter(i => i.paymentStatus === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          <CheckCircle size={16} />
          Completed ({invoices.filter(i => i.paymentStatus === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          <XCircle size={16} />
          Failed ({invoices.filter(i => i.paymentStatus === 'failed').length})
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className={`hover:bg-gray-50 ${invoice.paymentStatus === 'pending' ? 'bg-orange-50' : ''}`}>
                <td className="px-6 py-4">
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{invoice.items?.length || 0} items</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">
                    {invoice.user?.firstName || invoice.user?.lastName 
                      ? `${invoice.user?.firstName || ''} ${invoice.user?.lastName || ''}`.trim()
                      : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">{invoice.user?.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                    {getPaymentIcon(invoice.paymentMethod)}
                    {invoice.paymentMethod?.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(invoice.paymentStatus)}`}>
                    {getStatusIcon(invoice.paymentStatus)}
                    {invoice.paymentStatus?.charAt(0).toUpperCase() + invoice.paymentStatus?.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold">
                  ${parseFloat(invoice.totalAmount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    {invoice.paymentStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(invoice.id, 'completed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(invoice.id, 'failed')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No invoices found
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

// Invoice Detail Modal
const InvoiceDetailModal = ({ invoice, onClose, onUpdateStatus }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">{invoice.invoiceNumber}</h2>
            <p className="text-sm text-gray-500">
              {new Date(invoice.createdAt).toLocaleDateString('en-US', {
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

        {/* Customer Info */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold mb-2">Customer</h3>
          <p className="font-medium">
            {invoice.user?.firstName || invoice.user?.lastName 
              ? `${invoice.user?.firstName || ''} ${invoice.user?.lastName || ''}`.trim()
              : 'Unknown'}
          </p>
          <p className="text-sm text-gray-600">{invoice.user?.email}</p>
          {invoice.user?.phoneNumber && (
            <p className="text-sm text-gray-600">{invoice.user?.phoneNumber}</p>
          )}
        </div>

        {/* Order Items */}
        <div className="p-6 border-b">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {invoice.items?.map((item) => (
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
                  <p className="text-sm text-gray-500">
                    {item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">${parseFloat(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium uppercase">{invoice.paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Status</span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              invoice.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
              invoice.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
              invoice.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {invoice.paymentStatus?.charAt(0).toUpperCase() + invoice.paymentStatus?.slice(1)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total</span>
            <span>${parseFloat(invoice.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6">
          {invoice.paymentStatus === 'pending' ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onUpdateStatus(invoice.id, 'completed');
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                <CheckCircle size={20} />
                Approve Payment
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(invoice.id, 'failed');
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
              >
                <XCircle size={20} />
                Reject
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
