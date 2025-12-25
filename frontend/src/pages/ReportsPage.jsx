import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import {
  DollarSign, TrendingUp, ShoppingCart, Users, Package,
  AlertTriangle, CreditCard, ArrowUp, ArrowDown,
  BarChart3, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
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
          <AlertTriangle size={48} className="text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
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

  // Blue color palette only
  const BLUE_COLORS = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  // Order status data for pie chart
  const orderStatusData = [
    { name: 'Completed', value: kpis.orders?.completed || 0 },
    { name: 'Pending', value: kpis.orders?.pending || 0 },
    { name: 'Failed', value: kpis.orders?.failed || 0 }
  ].filter(item => item.value > 0);

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

      {/* Main KPI Cards - Blue Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">${kpis.totalRevenue?.value || '0'}</p>
              {kpis.totalRevenue?.change !== undefined && (
                <div className={`flex items-center text-sm mt-1 ${parseFloat(kpis.totalRevenue.change) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
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

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Transaction</p>
              <p className="text-2xl font-bold mt-1">${kpis.averageTransaction?.value || '0'}</p>
              <p className="text-sm text-gray-500 mt-1">Per order</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Weekly Growth</p>
              <p className="text-2xl font-bold mt-1">{kpis.salesGrowth?.growthRate || '0'}%</p>
              <p className="text-sm text-gray-500 mt-1">vs last week</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold mt-1">{kpis.customers?.total || 0}</p>
              <p className="text-sm text-blue-600 mt-1">+{kpis.customers?.newThisMonth || 0} this month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats - Blue Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white">
          <p className="text-blue-100 text-sm">Last 24 Hours Revenue</p>
          <p className="text-3xl font-bold mt-1">${kpis.last24Hours?.revenue || '0'}</p>
          <p className="text-blue-100 text-sm mt-2">{kpis.last24Hours?.orders || 0} orders</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <p className="text-blue-100 text-sm">Avg Purchase (24h)</p>
          <p className="text-3xl font-bold mt-1">${kpis.last24Hours?.averagePurchase || '0'}</p>
          <p className="text-blue-100 text-sm mt-2">Per customer</p>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-xl text-white">
          <p className="text-blue-100 text-sm">Median Payment</p>
          <p className="text-3xl font-bold mt-1">${kpis.medianPayment || '0'}</p>
          <p className="text-blue-100 text-sm mt-2">All time</p>
        </div>

        <div className="bg-gradient-to-r from-blue-300 to-blue-400 p-6 rounded-xl text-white">
          <p className="text-blue-100 text-sm">Today's Revenue</p>
          <p className="text-3xl font-bold mt-1">${kpis.today?.revenue || '0'}</p>
          <p className="text-blue-100 text-sm mt-2">{kpis.today?.orders || 0} orders</p>
        </div>
      </div>

      {/* Charts Row 1 */}
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
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#93c5fd" name="Revenue ($)" />
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
            <Activity size={20} className="text-blue-600" />
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
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No order data available
            </div>
          )}
        </div>
      </div>

      {/* Pie Charts Row - All Blue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600" />
            Payment Methods
          </h2>
          {kpis.paymentDistribution && kpis.paymentDistribution.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={kpis.paymentDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {kpis.paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BLUE_COLORS[index % BLUE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {kpis.paymentDistribution.map((entry, index) => (
                  <div key={entry.method} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BLUE_COLORS[index % BLUE_COLORS.length] }}></div>
                    <span className="text-sm text-gray-600 capitalize">{entry.method}</span>
                    <span className="text-sm font-semibold">({entry.count})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChartIcon size={48} className="mx-auto text-gray-300 mb-2" />
                <p>No payment data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon size={20} className="text-blue-600" />
            Order Status
          </h2>
          {orderStatusData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BLUE_COLORS[index % BLUE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {orderStatusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BLUE_COLORS[index % BLUE_COLORS.length] }}></div>
                    <span className="text-sm text-gray-600">{entry.name}</span>
                    <span className="text-sm font-semibold">({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChartIcon size={48} className="mx-auto text-gray-300 mb-2" />
                <p>No order data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Revenue by Payment Method Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-blue-600" />
            Revenue by Payment
          </h2>
          {kpis.paymentDistribution && kpis.paymentDistribution.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={kpis.paymentDistribution.map(p => ({ ...p, totalNum: parseFloat(p.total) || 0 }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="totalNum"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {kpis.paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BLUE_COLORS[index % BLUE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {kpis.paymentDistribution.map((entry, index) => (
                  <div key={entry.method} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BLUE_COLORS[index % BLUE_COLORS.length] }}></div>
                    <span className="text-sm text-gray-600 capitalize">{entry.method}</span>
                    <span className="text-sm font-semibold">(${entry.total})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChartIcon size={48} className="mx-auto text-gray-300 mb-2" />
                <p>No revenue data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
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
                <Bar dataKey="quantitySold" fill="#3b82f6" name="Units Sold" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-2" />
                <p>No product data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-blue-500" />
            Low Stock Products
          </h2>
          {kpis.lowStock && kpis.lowStock.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {kpis.lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
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
                  <span className="font-bold text-sm text-blue-600">
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
          <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-gray-600 font-medium">This Week</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">${kpis.salesGrowth?.thisWeek || '0'}</p>
            <p className="text-sm text-gray-500 mt-2">Current period</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
            <p className="text-gray-600 font-medium">Last Week</p>
            <p className="text-4xl font-bold text-gray-600 mt-2">${kpis.salesGrowth?.lastWeek || '0'}</p>
            <p className="text-sm text-gray-500 mt-2">Previous period</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            parseFloat(kpis.salesGrowth?.growthRate || 0) >= 0 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {parseFloat(kpis.salesGrowth?.growthRate || 0) >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
            <span className="font-semibold">{Math.abs(parseFloat(kpis.salesGrowth?.growthRate || 0))}% {parseFloat(kpis.salesGrowth?.growthRate || 0) >= 0 ? 'Growth' : 'Decline'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
