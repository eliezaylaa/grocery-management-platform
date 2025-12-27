import React, { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';
import { receiptService } from '../services/receiptService';
import { 
  Search, Filter, Eye, CheckCircle, XCircle, Clock, 
  CreditCard, Banknote, Wallet, Package, X, Download, 
  Mail, Loader2, AlertCircle
} from 'lucide-react';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [emailing, setEmailing] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await invoiceService.getAll();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      await invoiceService.update(invoiceId, { paymentStatus: newStatus });
      loadInvoices();
      setSelectedInvoice(null);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDownloadPDF = async (invoiceId, e) => {
    if (e) e.stopPropagation();
    setDownloading(invoiceId);
    try {
      await receiptService.downloadPDF(invoiceId);
    } catch (error) {
      alert('Failed to download receipt');
    } finally {
      setDownloading(null);
    }
  };

  const handleSendEmail = async (invoiceId, e) => {
    if (e) e.stopPropagation();
    setEmailing(invoiceId);
    setEmailError(null);
    try {
      await receiptService.sendEmail(invoiceId);
      setEmailSuccess(invoiceId);
      setTimeout(() => setEmailSuccess(null), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send email';
      if (errorMsg.includes('Demo limitation') || errorMsg.includes('only send testing')) {
        setEmailError('Demo mode: Email only works for eliezaylaa@gmail.com');
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
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'pending': return <Clock size={16} className="text-orange-500" />;
      case 'failed': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-orange-100 text-orange-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'card': return <CreditCard size={16} className="text-blue-500" />;
      case 'cash': return <Banknote size={16} className="text-green-500" />;
      case 'paypal': return <Wallet size={16} className="text-yellow-500" />;
      default: return <CreditCard size={16} className="text-gray-400" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = invoices.filter(i => i.paymentStatus === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage orders and payments</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <Clock size={20} />
            <span className="font-medium">{pendingCount} pending</span>
          </div>
        )}
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by invoice number, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'completed', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && pendingCount > 0 && (
                  <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => (
                <tr 
                  key={invoice.id} 
                  className={`hover:bg-gray-50 cursor-pointer ${
                    invoice.paymentStatus === 'pending' ? 'bg-orange-50' : ''
                  }`}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{invoice.items?.length || 0} items</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{invoice.user?.firstName} {invoice.user?.lastName}</p>
                    <p className="text-xs text-gray-500">{invoice.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(invoice.paymentMethod)}
                      <span className="text-sm capitalize">{invoice.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.paymentStatus)}`}>
                      {getStatusIcon(invoice.paymentStatus)}
                      {invoice.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    €{parseFloat(invoice.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDownloadPDF(invoice.id, e)}
                        disabled={downloading === invoice.id}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                        title="Download PDF"
                      >
                        {downloading === invoice.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Download size={18} />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleSendEmail(invoice.id, e)}
                        disabled={emailing === invoice.id}
                        className={`p-2 rounded-lg disabled:opacity-50 ${
                          emailSuccess === invoice.id 
                            ? 'text-green-600 bg-green-50' 
                            : 'text-purple-600 hover:bg-purple-50'
                        }`}
                        title="Email Receipt"
                      >
                        {emailing === invoice.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : emailSuccess === invoice.id ? (
                          <CheckCircle size={18} />
                        ) : (
                          <Mail size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No invoices found</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onStatusUpdate={handleStatusUpdate}
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

// Invoice Detail Modal
const InvoiceDetailModal = ({ invoice, onClose, onStatusUpdate, onDownload, onEmail, downloading, emailing, emailSuccess }) => {
  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-orange-100 text-orange-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h2>
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
          <p className="text-gray-900">{invoice.user?.firstName} {invoice.user?.lastName}</p>
          <p className="text-sm text-gray-600">{invoice.user?.email}</p>
          {invoice.user?.phoneNumber && (
            <p className="text-sm text-gray-600">{invoice.user.phoneNumber}</p>
          )}
        </div>

        {/* Order Items */}
        <div className="p-6 border-b">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {invoice.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                {item.product?.pictureUrl ? (
                  <img src={item.product.pictureUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-gray-400" />
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
            <span className="font-medium capitalize">{invoice.paymentMethod}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.paymentStatus)}`}>
              {invoice.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-4 border-t mt-4">
            <span>Total</span>
            <span>€{parseFloat(invoice.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          {/* PDF & Email Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onDownload(invoice.id)}
              disabled={downloading === invoice.id}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {downloading === invoice.id ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              Download PDF
            </button>
            <button
              onClick={() => onEmail(invoice.id)}
              disabled={emailing === invoice.id}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg disabled:opacity-50 ${
                emailSuccess === invoice.id
                  ? 'bg-green-600 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {emailing === invoice.id ? (
                <Loader2 size={20} className="animate-spin" />
              ) : emailSuccess === invoice.id ? (
                <CheckCircle size={20} />
              ) : (
                <Mail size={20} />
              )}
              {emailSuccess === invoice.id ? 'Sent!' : 'Email Receipt'}
            </button>
          </div>

          {/* Status Update Buttons for Pending Orders */}
          {invoice.paymentStatus === 'pending' && (
            <div className="flex gap-3 pt-3 border-t">
              <button
                onClick={() => onStatusUpdate(invoice.id, 'completed')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle size={20} />
                Approve Payment
              </button>
              <button
                onClick={() => onStatusUpdate(invoice.id, 'failed')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <XCircle size={20} />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
