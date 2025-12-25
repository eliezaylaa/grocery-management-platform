import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import {
  DollarSign, TrendingUp, ShoppingCart, Users, Package,
  CreditCard, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

export const ReportsPage = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      setLoading(true);
      const data = await reportService.getKPIs();
      setKpis(data);
    } catch (error) {
      console.error('Failed to load KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Failed to load reports</p>
        <button onClick={loadKPIs} className="text-indigo-600 hover:text-indigo-700">Try again</button>
      </div>
    );
  }

  // Payment method colors - Card purple, PayPal yellow, Cash green
  const PAYMENT_COLORS = {
    card: '#6366F1',
    paypal: '#EAB308', 
    cash: '#10B981',
    unknown: '#6B7280'
  };

  const paymentData = (kpis.paymentDistribution || []).map(p => ({
    name: p.method ? p.method.charAt(0).toUpperCase() + p.method.slice(1) : 'Unknown',
    value: parseInt(p.count) || 0,
    total: parseFloat(p.total) || 0,
    color: PAYMENT_COLORS[p.method] || '#6B7280'
  }));

  const totalPaymentOrders = paymentData.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Analytics and insights</p>
        </div>
        <button 
          onClick={loadKPIs}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-xl font-semibold">${kpis.totalRevenue?.value || '0'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg. Order</p>
              <p className="text-xl font-semibold">${kpis.averageTransaction?.value || '0'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Customers</p>
              <p className="text-xl font-semibold">{kpis.customers?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Weekly Growth</p>
              <p className="text-xl font-semibold">{kpis.salesGrowth?.growthRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h2>
          {kpis.dailySales?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={kpis.dailySales}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dayName" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>

        {/* Payment Methods Pie - SOLID DISK */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="font-medium text-gray-900 mb-1">Payment Methods</h2>
          <p className="text-xs text-gray-500 mb-4">All time purchases</p>
          {paymentData.length > 0 && totalPaymentOrders > 0 ? (
            <div>
              <div className="flex justify-center">
                <PieChart width={180} height={180}>
                  <Pie
                    data={paymentData}
                    cx={90}
                    cy={90}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value, name, props) => [`${value} orders`, props.payload.name]}
                  />
                </PieChart>
              </div>
              <div className="text-center mb-4">
                <p className="text-2xl font-semibold text-gray-900">{totalPaymentOrders}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
              <div className="space-y-2">
                {paymentData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                    <span className="font-medium">{entry.value} · ${entry.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <CreditCard size={32} className="mb-2 text-gray-300" />
              <p className="text-sm">No payment data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Daily Orders</h2>
          {kpis.dailySales?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={kpis.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dayName" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="orders" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Today's Revenue</span>
              <span className="font-semibold">${kpis.today?.revenue || '0'}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Today's Orders</span>
              <span className="font-semibold">{kpis.today?.orders || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">24h Average</span>
              <span className="font-semibold">${kpis.last24Hours?.averagePurchase || '0'}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Median Payment</span>
              <span className="font-semibold">${kpis.medianPayment || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">New Customers</span>
              <span className="font-semibold text-emerald-600">+{kpis.customers?.newThisMonth || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Top Products</h2>
          {kpis.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {kpis.topProducts.slice(0, 5).map((product, index) => {
                const maxQty = Math.max(...kpis.topProducts.slice(0, 5).map(p => p.quantitySold));
                const percentage = maxQty > 0 ? (product.quantitySold / maxQty) * 100 : 0;
                return (
                  <div key={product.id || index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 truncate pr-4">{product.name}</span>
                      <span className="text-gray-500 whitespace-nowrap">{product.quantitySold} sold</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Low Stock</h2>
            {kpis.lowStock?.length > 0 && (
              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">{kpis.lowStock.length}</span>
            )}
          </div>
          {kpis.lowStock?.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {kpis.lowStock.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  {product.pictureUrl ? (
                    <img src={product.pictureUrl} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <Package size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                  <span className={`text-sm font-medium ${product.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {product.stockQuantity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">All stocked</div>
          )}
        </div>
      </div>

      {/* Weekly Comparison */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white">
        <h2 className="font-medium mb-4">Weekly Comparison</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-400 text-xs uppercase">This Week</p>
            <p className="text-2xl font-semibold mt-1">${kpis.salesGrowth?.thisWeek || '0'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">Last Week</p>
            <p className="text-2xl font-semibold mt-1">${kpis.salesGrowth?.lastWeek || '0'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">Growth</p>
            <p className={`text-2xl font-semibold mt-1 ${parseFloat(kpis.salesGrowth?.growthRate) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {parseFloat(kpis.salesGrowth?.growthRate) >= 0 ? '+' : ''}{kpis.salesGrowth?.growthRate || 0}%
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">Pending</p>
            <p className="text-2xl font-semibold mt-1">{kpis.orders?.pending || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
