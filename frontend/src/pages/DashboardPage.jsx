import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import { invoiceService } from '../services/invoiceService';
import { productService } from '../services/productService';
import { 
  ShoppingCart, AlertTriangle, DollarSign, TrendingUp, Package, 
  ShoppingBag, Clock, CheckCircle, CreditCard, ArrowRight, Star,
  Clipboard, BoxIcon, Users, Eye, Truck, Activity, BarChart3, PieChart
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
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
    return <div className="text-center py-20">Loading dashboard...</div>;
  }

  if (!kpis) {
    return <div className="text-center py-20">Failed to load dashboard data</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your store overview.</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">${kpis.totalRevenue?.value || '0'}</p>
              <p className={`text-sm mt-1 ${parseFloat(kpis.totalRevenue?.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(kpis.totalRevenue?.change) >= 0 ? '+' : ''}{kpis.totalRevenue?.change || 0}% vs last month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Transaction</p>
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
              <p className="text-sm text-gray-500">Sales Growth</p>
              <p className="text-2xl font-bold mt-1">{kpis.salesGrowth?.growthRate || '0'}%</p>
              <p className="text-sm text-gray-500 mt-1">vs last week</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/products?lowStock=true')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold mt-1">{kpis.lowStock?.length || 0}</p>
              <p className="text-sm text-orange-600 mt-1">Need attention</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Last 24 Hours</p>
              <p className="text-3xl font-bold mt-1">${kpis.last24Hours?.revenue || '0'}</p>
              <p className="text-blue-100 text-sm mt-1">{kpis.last24Hours?.orders || 0} orders</p>
            </div>
            <Activity size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Avg Purchase (24h)</p>
              <p className="text-3xl font-bold mt-1">${kpis.last24Hours?.averagePurchase || '0'}</p>
              <p className="text-green-100 text-sm mt-1">Per customer</p>
            </div>
            <BarChart3 size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Median Payment</p>
              <p className="text-3xl font-bold mt-1">${kpis.medianPayment || '0'}</p>
              <p className="text-purple-100 text-sm mt-1">All time</p>
            </div>
            <PieChart size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Customers</p>
              <p className="text-3xl font-bold mt-1">{kpis.customers?.total || 0}</p>
              <p className="text-orange-100 text-sm mt-1">+{kpis.customers?.newThisMonth || 0} this month</p>
            </div>
            <Users size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sales Trend (Last 7 Days)</h2>
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
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#93c5fd" name="revenue" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No sales data yet
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
          {kpis.topProducts && kpis.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.topProducts.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quantitySold" fill="#10b981" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No sales data yet
            </div>
          )}
        </div>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
          {kpis.paymentDistribution && kpis.paymentDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={kpis.paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  label={(entry) => entry.method}
                >
                  {kpis.paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No payment data yet
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <span className="font-medium">Completed</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{kpis.orders?.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="text-yellow-600" size={24} />
                <span className="font-medium">Pending</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{kpis.orders?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={24} />
                <span className="font-medium">Failed</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{kpis.orders?.failed || 0}</span>
            </div>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Today's Performance</h2>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-blue-600">${kpis.today?.revenue || '0'}</p>
            <p className="text-gray-500 mt-2">Revenue Today</p>
            <div className="mt-4 pt-4 border-t">
              <p className="text-3xl font-bold text-gray-800">{kpis.today?.orders || 0}</p>
              <p className="text-gray-500">Orders Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {kpis.lowStock && kpis.lowStock.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              Low Stock Alert
            </h2>
            <button
              onClick={() => navigate('/products?lowStock=true')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.lowStock.slice(0, 4).map((product) => (
              <div key={product.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                {product.pictureUrl ? (
                  <img src={product.pictureUrl} alt={product.name} className="w-full h-24 object-cover rounded mb-2" />
                ) : (
                  <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <Package size={32} className="text-gray-400" />
                  </div>
                )}
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
                <p className="text-red-600 font-bold mt-2">Only {product.stockQuantity} left!</p>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const todayOrders = invoices.filter(inv => {
    const today = new Date().toDateString();
    return new Date(inv.createdAt).toDateString() === today;
  });
  const lowStockProducts = products.filter(p => p.stockQuantity <= 10);
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);

  if (loading) {
    return <div className="text-center py-20">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">
          Welcome, {user?.firstName || 'Team Member'}! 👋
        </h1>
        <p className="mt-2 text-green-100">
          Here's your shift overview for today
        </p>
        <p className="mt-1 text-green-200 text-sm">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{todayOrders.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clipboard size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{pendingOrders.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{lowStockProducts.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{outOfStockProducts.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <BoxIcon size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/products')}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-4 border-2 border-transparent hover:border-blue-500"
        >
          <div className="bg-blue-100 p-4 rounded-full">
            <Package size={28} className="text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">Manage Products</h3>
            <p className="text-gray-500 text-sm">View & update inventory</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/invoices')}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-4 border-2 border-transparent hover:border-green-500"
        >
          <div className="bg-green-100 p-4 rounded-full">
            <Clipboard size={28} className="text-green-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">View Orders</h3>
            <p className="text-gray-500 text-sm">Process customer orders</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/shop')}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-4 border-2 border-transparent hover:border-purple-500"
        >
          <div className="bg-purple-100 p-4 rounded-full">
            <ShoppingCart size={28} className="text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">New Sale</h3>
            <p className="text-gray-500 text-sm">Create customer order</p>
          </div>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <button
            onClick={() => navigate('/invoices')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 10).map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{order.invoiceNumber}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.user?.firstName || order.user?.email?.split('@')[0] || 'Customer'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{order.items?.length || 0}</td>
                    <td className="py-3 px-4 font-semibold">${parseFloat(order.totalAmount).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        order.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Clipboard size={48} className="mx-auto text-gray-300 mb-4" />
            <p>No orders yet today</p>
          </div>
        )}
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

  const totalSpent = orders
    .filter(o => o.paymentStatus === 'completed')
    .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');
  const completedOrders = orders.filter(o => o.paymentStatus === 'completed');

  if (loading) {
    return <div className="text-center py-20">Loading your dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || 'Customer'}! 👋
        </h1>
        <p className="mt-2 text-blue-100">
          Here's what's happening with your orders
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CreditCard size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{pendingOrders.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{completedOrders.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <CheckCircle size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/shop')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <ShoppingCart size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold">Start Shopping</h3>
              <p className="text-blue-100">Browse our products</p>
            </div>
          </div>
          <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/my-orders')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Package size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold">View Orders</h3>
              <p className="text-purple-100">Track your purchases</p>
            </div>
          </div>
          <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Orders</h2>
        
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    order.paymentStatus === 'completed' ? 'bg-green-100' :
                    order.paymentStatus === 'pending' ? 'bg-orange-100' : 'bg-red-100'
                  }`}>
                    {order.paymentStatus === 'completed' ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <Clock size={20} className="text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{order.invoiceNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${parseFloat(order.totalAmount).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No orders yet</p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
export const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === 'customer') {
    return <CustomerDashboard />;
  }
  
  if (user?.role === 'employee') {
    return <EmployeeDashboard />;
  }

  return <ManagerDashboard />;
};
