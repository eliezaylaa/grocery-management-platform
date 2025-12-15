import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { TrendingUp, ShoppingCart, Users, AlertTriangle, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
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
        />
        <StatCard
          title="Low Stock Items"
          value={kpis.lowStock.length}
          icon={AlertTriangle}
          color="bg-red-500"
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

      {/* Low Stock Alert */}
      {kpis.lowStock.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Low Stock Alert
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.lowStock.slice(0, 6).map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4">
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
    </div>
  );
};
