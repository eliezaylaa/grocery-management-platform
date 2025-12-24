import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import {
  DollarSign, TrendingUp, ShoppingCart, Users, Package,
  AlertTriangle, CreditCard, ArrowUp, ArrowDown, Calendar,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from 'recharts';

export const ReportsPage = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getKPIs();
      setKpis(data);
    } catch (error) {
      console.error('Failed to load KPIs:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadKPIs}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="text-center py-20 text-gray-500">
        No report data available
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights</p>
        </div>
        <button
          onClick={loadKPIs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Activity size={18} />
          Refresh
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">${kpis.totalRevenue?.value || '0'}</p>
              {kpis.totalRevenue?.change !== undefined && (
                <div className={`flex items-center text-sm mt-1 ${parseFloat(kpis.totalRevenue.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(kpis.totalRevenue.change) >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  <span>{Math.abs(kpis.totalRevenue.change)}% vs last month</span>
                </div>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Transaction</p>
              <p className="text-2xl font-bold mt-1">${kpis.averageTransaction?.value || '0'}</p>
              <p className="text-sm text-gray-500 mt-1">Per order</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingCart size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Weekly Growth</p>
              <p className="text-2xl font-bold mt-1">{kpis.salesGrowth?.growthRate || '0'}%</p>
              <p className="text-sm text-gray-500 mt-1">vs last week</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold mt-1">{kpis.customers?.total || 0}</p>
              <p className="text-sm text-green-600 mt-1">+{kpis.customers?.newThisMonth || 0} this month</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <p className="text-blue-100 text-sm">Last 24 Hours Revenue</p>
          <p className="text-3xl font-bold mt-1">${kpis.last24Hours?.revenue || '0'}</p>
          <p className="text-blue-100 text-sm mt-2">{kpis.last24Hours?.orders || 0} orders</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <p className="text-green-100 text-sm">Avg Purchase (24h)</p>
          <p className="text-3xl font-bold mt-1">${kpis.last24Hours?.averagePurchase || '0'}</p>
          <p className="text-green-100 text-sm mt-2">Per customer</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <p className="text-purple-100 text-sm">Median Payment</p>
          <p className="text-3xl font-bold mt-1">${kpis.medianPayment || '0'}</p>
          <p className="text-purple-100 text-sm mt-2">All time</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <p className="text-orange-100 text-sm">Today's Revenue</p>
          <p className="text-3xl font-bold mt-1">${kpis.today?.revenue || '0'}</p>
          <p className="text-orange-100 text-sm mt-2">{kpis.today?.orders || 0} orders</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Sales Trend (Last 7 Days)
          </h2>
          {kpis.dailySales && kpis.dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={kpis.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayName" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#93c5fd" name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No sales data available
            </div>
          )}
        </div>

        {/* Orders by Day */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-green-600" />
            Orders by Day
          </h2>
          {kpis.dailySales && kpis.dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#10b981" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No order data available
            </div>
          )}
        </div>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package size={20} className="text-purple-600" />
            Top Selling Products
          </h2>
          {kpis.topProducts && kpis.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.topProducts.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'quantitySold' ? 'Units Sold' : name]}
                />
                <Bar dataKey="quantitySold" fill="#8b5cf6" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No product data available
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600" />
            Payment Methods
          </h2>
          {kpis.paymentDistribution && kpis.paymentDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={kpis.paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  label={(entry) => entry.method}
                >
                  {kpis.paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Orders']} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No payment data available
            </div>
          )}
        </div>
      </div>

      {/* Order Status & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Status Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <ShoppingCart size={20} className="text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Completed Orders</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{kpis.orders?.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Calendar size={20} className="text-yellow-600" />
                </div>
                <span className="font-medium text-gray-700">Pending Orders</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{kpis.orders?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <span className="font-medium text-gray-700">Failed Orders</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{kpis.orders?.failed || 0}</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" />
            Low Stock Products
          </h2>
          {kpis.lowStock && kpis.lowStock.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {kpis.lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    {product.pictureUrl ? (
                      <img src={product.pictureUrl} alt={product.name} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <Package size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${product.stockQuantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    {product.stockQuantity === 0 ? 'Out of Stock' : `${product.stockQuantity} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto text-gray-300 mb-2" />
              <p>All products are well stocked!</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Comparison */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Weekly Revenue Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-600">This Week</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">${kpis.salesGrowth?.thisWeek || '0'}</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Last Week</p>
            <p className="text-4xl font-bold text-gray-600 mt-2">${kpis.salesGrowth?.lastWeek || '0'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
