import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import { invoiceService } from '../services/invoiceService';
import { productService } from '../services/productService';
import { 
  ShoppingCart, AlertTriangle, DollarSign, TrendingUp, Package, 
  ShoppingBag, Clock, CheckCircle, CreditCard, ArrowRight,
  Clipboard, BoxIcon, Users, Activity, Wallet, Banknote
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// ==================== MANAGER/ADMIN DASHBOARD ====================
const ManagerDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!kpis) {
    return <div className="text-center py-20 text-gray-500">Failed to load dashboard</div>;
  }

  // Payment method colors - distinct professional colors
  const PAYMENT_COLORS = {
    card: '#4F46E5',    // Indigo
    paypal: '#0EA5E9',  // Sky blue
    cash: '#10B981'     // Emerald
  };

  const paymentData = kpis.paymentDistribution?.map(p => ({
    name: p.method.charAt(0).toUpperCase() + p.method.slice(1),
    value: p.count,
    total: parseFloat(p.total),
    color: PAYMENT_COLORS[p.method] || '#6B7280'
  })) || [];

  const totalOrders = (kpis.orders?.completed || 0) + (kpis.orders?.pending || 0) + (kpis.orders?.failed || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your store performance</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">${kpis.totalRevenue?.value || '0'}</p>
              {kpis.totalRevenue?.change !== 0 && (
                <p className={`text-xs mt-1 ${parseFloat(kpis.totalRevenue?.change) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {parseFloat(kpis.totalRevenue?.change) >= 0 ? '↑' : '↓'} {Math.abs(kpis.totalRevenue?.change)}% from last month
                </p>
              )}
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Orders</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">{kpis.orders?.pending || 0} pending</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customers</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{kpis.customers?.total || 0}</p>
              <p className="text-xs text-emerald-600 mt-1">+{kpis.customers?.newThisMonth || 0} this month</p>
            </div>
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Order</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">${kpis.averageTransaction?.value || '0'}</p>
              <p className="text-xs text-gray-500 mt-1">Median: ${kpis.medianPayment || '0'}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Revenue Overview</h2>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          {kpis.dailySales && kpis.dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={kpis.dailySales}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dayName" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400">
              No sales data available
            </div>
          )}
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Payment Methods</h2>
          {paymentData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value, name, props) => [value, `${props.payload.name} orders`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {paymentData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">{entry.value}</span>
                      <span className="text-gray-400 ml-1">· ${entry.total.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400">
              No payment data
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products - Horizontal Bars */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Top Products</h2>
            <button onClick={() => navigate('/products')} className="text-xs text-indigo-600 hover:text-indigo-700">
              View all →
            </button>
          </div>
          {kpis.topProducts && kpis.topProducts.length > 0 ? (
            <div className="space-y-3">
              {kpis.topProducts.slice(0, 5).map((product, index) => {
                const maxQty = Math.max(...kpis.topProducts.slice(0, 5).map(p => p.quantitySold));
                const percentage = (product.quantitySold / maxQty) * 100;
                return (
                  <div key={product.id || index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 truncate pr-4">{product.name}</span>
                      <span className="text-gray-500 whitespace-nowrap">{product.quantitySold} sold</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              No product data
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Low Stock Alert</h2>
            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
              {kpis.lowStock?.length || 0} items
            </span>
          </div>
          {kpis.lowStock && kpis.lowStock.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {kpis.lowStock.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  {product.pictureUrl ? (
                    <img src={product.pictureUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                  <div className={`text-sm font-medium ${product.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {product.stockQuantity === 0 ? 'Out' : product.stockQuantity}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <CheckCircle size={32} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-sm">All stocked up!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-5 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Today</p>
            <p className="text-xl font-semibold mt-1">${kpis.today?.revenue || '0'}</p>
            <p className="text-gray-400 text-xs">{kpis.today?.orders || 0} orders</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">24h Average</p>
            <p className="text-xl font-semibold mt-1">${kpis.last24Hours?.averagePurchase || '0'}</p>
            <p className="text-gray-400 text-xs">per order</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">This Week</p>
            <p className="text-xl font-semibold mt-1">${kpis.salesGrowth?.thisWeek || '0'}</p>
            <p className={`text-xs ${parseFloat(kpis.salesGrowth?.growthRate) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {parseFloat(kpis.salesGrowth?.growthRate) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(kpis.salesGrowth?.growthRate || 0))}% vs last week
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Pending</p>
            <p className="text-xl font-semibold mt-1">{kpis.orders?.pending || 0}</p>
            <p className="text-gray-400 text-xs">awaiting approval</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== EMPLOYEE DASHBOARD ====================
const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesData, productsData] = await Promise.all([
        invoiceService.getAll({ limit: 10 }),
        productService.getAll({ limit: 50, lowStock: 'true' })
      ]);
      setInvoices(invoicesData.invoices || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = invoices.filter(inv => inv.paymentStatus === 'pending');
  const todayOrders = invoices.filter(inv => new Date(inv.createdAt).toDateString() === new Date().toDateString());
  const lowStockProducts = products.filter(p => p.stockQuantity <= 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.firstName || 'there'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Today's Orders</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{todayOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">{pendingOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Low Stock</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{lowStockProducts.length}</p>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Products</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{products.length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => navigate('/products')} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-gray-300 transition-colors text-left">
          <Package size={20} className="text-gray-400 mb-2" />
          <p className="font-medium text-gray-900">Products</p>
          <p className="text-xs text-gray-500">Manage inventory</p>
        </button>
        <button onClick={() => navigate('/invoices')} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-gray-300 transition-colors text-left">
          <Clipboard size={20} className="text-gray-400 mb-2" />
          <p className="font-medium text-gray-900">Orders</p>
          <p className="text-xs text-gray-500">View all orders</p>
        </button>
        <button onClick={() => navigate('/shop')} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-gray-300 transition-colors text-left">
          <ShoppingCart size={20} className="text-gray-400 mb-2" />
          <p className="font-medium text-gray-900">New Sale</p>
          <p className="text-xs text-gray-500">Create order</p>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">Recent Orders</h2>
          <button onClick={() => navigate('/invoices')} className="text-xs text-indigo-600">View all →</button>
        </div>
        <div className="divide-y divide-gray-50">
          {invoices.slice(0, 5).map(order => (
            <div key={order.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">{order.invoiceNumber}</p>
                <p className="text-xs text-gray-500">{order.user?.firstName || 'Customer'}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">${parseFloat(order.totalAmount).toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  order.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  order.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== CUSTOMER DASHBOARD ====================
const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const totalSpent = orders.filter(o => o.paymentStatus === 'completed').reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Welcome back, {user?.firstName || 'there'}</h1>
        <p className="text-gray-500 text-sm mt-1">Track your orders and shopping activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Orders</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Spent</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">{orders.filter(o => o.paymentStatus === 'pending').length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/shop')} className="bg-gray-900 text-white rounded-lg p-5 text-left hover:bg-gray-800 transition-colors">
          <ShoppingCart size={24} className="mb-3" />
          <p className="font-medium">Start Shopping</p>
          <p className="text-gray-400 text-sm">Browse products</p>
        </button>
        <button onClick={() => navigate('/my-orders')} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 text-left hover:border-gray-300 transition-colors">
          <Package size={24} className="text-gray-400 mb-3" />
          <p className="font-medium text-gray-900">My Orders</p>
          <p className="text-gray-500 text-sm">View history</p>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900">Recent Orders</h2>
        </div>
        {orders.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">{order.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">${parseFloat(order.totalAmount).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <ShoppingBag size={32} className="mx-auto mb-2" />
            <p>No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN ====================
export const DashboardPage = () => {
  const { user } = useAuth();
  if (user?.role === 'customer') return <CustomerDashboard />;
  if (user?.role === 'employee') return <EmployeeDashboard />;
  return <ManagerDashboard />;
};
