import React, { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';
import { productService } from '../services/productService';
import api from '../services/api';
import { Plus, Trash2, Eye } from 'lucide-react';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadInvoices();
    loadUsers();
    loadProducts();
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

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.delete(id);
        loadInvoices();
      } catch (error) {
        alert('Failed to delete invoice');
      }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Manage customer orders</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Order
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading orders...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {invoice.user?.firstName} {invoice.user?.lastName || invoice.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${parseFloat(invoice.totalAmount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{invoice.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.paymentStatus)}`}>
                      {invoice.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <InvoiceModal
          users={users}
          products={products}
          onClose={() => setShowModal(false)}
          onSave={loadInvoices}
        />
      )}
    </div>
  );
};

const InvoiceModal = ({ users, products, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    userId: '',
    paymentMethod: 'cash',
    items: []
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const existingItem = formData.items.find(i => i.productId === selectedProduct);
    if (existingItem) {
      setFormData({
        ...formData,
        items: formData.items.map(i =>
          i.productId === selectedProduct
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, {
          productId: selectedProduct,
          product: product,
          quantity: quantity,
          unitPrice: parseFloat(product.price)
        }]
      });
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (productId) => {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.productId !== productId)
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId || formData.items.length === 0) {
      alert('Please select a customer and add at least one product');
      return;
    }

    setLoading(true);
    try {
      await invoiceService.create({
        userId: formData.userId,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'completed',
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });
      onSave();
      onClose();
    } catch (error) {
      alert('Failed to create order: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Order</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a customer</option>
              {users.filter(u => u.role === 'customer').map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Add Products</h3>
            <div className="flex gap-3">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price} (Stock: {product.stockQuantity})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {formData.items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item) => (
                    <tr key={item.productId} className="border-t">
                      <td className="px-4 py-2">{item.product.name}</td>
                      <td className="px-4 py-2">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50 font-bold">
                    <td colSpan="3" className="px-4 py-2 text-right">Total:</td>
                    <td className="px-4 py-2">${calculateTotal().toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
