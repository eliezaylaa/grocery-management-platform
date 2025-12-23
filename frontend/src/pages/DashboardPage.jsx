import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { TrendingUp, ShoppingCart, Users, AlertTriangle, DollarSign, ChevronRight, User, Crown } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StatCard = ({ title, value, change, icon: Icon, color, onClick }) => (
  <div 
    className={`bg-white p-6 rounded-lg shadow-md ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {change !== undefined && (
          <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from previous period
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

export const DashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      const data = await reportService.getKPIs();
      setKpis(data);
    } catch (error) {
      console.error('Failed to load KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading dashboard...</div>;
  }

  if (!kpis) {
    return <div className="text-center py-20">Failed to load dashboard data</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${kpis.totalRevenue.value}`}
          change={parseFloat(kpis.totalRevenue.change)}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          title="Avg Transaction"
          value={`$${kpis.averageTransaction.value}`}
          icon={ShoppingCart}
          color="bg-green-500"
        />
        <StatCard
          title="New Customers"
          value={kpis.customerAcquisition.newCustomers}
          icon={Users}
          color="bg-purple-500"
          onClick={() => navigate('/users?role=customer')}
        />
        <StatCard
          title="Low Stock Items"
          value={kpis.lowStock.length}
          icon={AlertTriangle}
          color="bg-red-500"
          onClick={() => navigate('/products?lowStock=true')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpis.topProducts.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantitySold" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={kpis.paymentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.method}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {kpis.paymentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers Section */}
      {kpis.topCustomers && kpis.topCustomers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Crown className="text-yellow-500" />
              Top Customers
            </h2>
            <button
              onClick={() => navigate('/users?role=customer')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {kpis.topCustomers.slice(0, 5).map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">
                      {customer.firstName || customer.lastName 
                        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                        : 'No Name'}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{customer.orderCount} orders</span>
                  <span className="font-semibold text-green-600">${customer.totalSpent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Customers Section */}
      {kpis.recentCustomers && kpis.recentCustomers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="text-blue-500" />
              Recent Customers
            </h2>
            <button
              onClick={() => navigate('/users?role=customer')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kpis.recentCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {customer.firstName || customer.lastName 
                              ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                              : 'No Name'}
                          </p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {customer.city ? `${customer.city}, ${customer.country}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{customer.totalOrders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">${customer.totalSpent}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={16} className="text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {kpis.lowStock.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              Low Stock Alert
            </h2>
            <button
              onClick={() => navigate('/products?lowStock=true')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.lowStock.slice(0, 6).map((product) => (
              <div 
                key={product.id} 
                className="border border-gray-200 rounded-lg p-4 hover:border-red-300 cursor-pointer"
                onClick={() => navigate('/products')}
              >
                {product.pictureUrl && (
                  <img
                    src={product.pictureUrl}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
                <p className="text-red-600 font-semibold mt-2">
                  Stock: {product.stockQuantity} units
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

// Customer Detail Modal Component
const CustomerDetailModal = ({ customer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Customer Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
            <User size={32} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">
              {customer.firstName || customer.lastName 
                ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                : 'No Name'}
            </h3>
            <p className="text-gray-500">{customer.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Location</span>
            <span className="font-medium">
              {customer.city ? `${customer.city}, ${customer.country}` : 'Not specified'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total Orders</span>
            <span className="font-medium">{customer.totalOrders || customer.orderCount || 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total Spent</span>
            <span className="font-semibold text-green-600">${customer.totalSpent}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium">
              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
