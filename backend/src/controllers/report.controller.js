const { Invoice, InvoiceItem, Product, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../models').sequelize;

exports.getKPIs = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total Revenue (completed orders)
    const completedOrders = await Invoice.findAll({
      where: { paymentStatus: 'completed' }
    });
    const totalRevenue = completedOrders.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);

    // Revenue this month vs last month
    const thisMonthOrders = await Invoice.findAll({
      where: { 
        paymentStatus: 'completed',
        createdAt: { [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1) }
      }
    });
    const thisMonthRevenue = thisMonthOrders.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);

    const lastMonthOrders = await Invoice.findAll({
      where: { 
        paymentStatus: 'completed',
        createdAt: { 
          [Op.gte]: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          [Op.lt]: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      }
    });
    const lastMonthRevenue = lastMonthOrders.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);

    const revenueChange = lastMonthRevenue > 0 
      ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : 0;

    // Average Transaction
    const avgTransaction = completedOrders.length > 0 
      ? (totalRevenue / completedOrders.length).toFixed(2)
      : '0.00';

    // Sales Growth (this week vs last week)
    const thisWeekOrders = await Invoice.findAll({
      where: { 
        paymentStatus: 'completed',
        createdAt: { [Op.gte]: last7Days }
      }
    });
    const thisWeekRevenue = thisWeekOrders.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);

    const lastWeekOrders = await Invoice.findAll({
      where: { 
        paymentStatus: 'completed',
        createdAt: { 
          [Op.gte]: lastWeekStart,
          [Op.lt]: lastWeekEnd
        }
      }
    });
    const lastWeekRevenue = lastWeekOrders.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);

    const salesGrowth = lastWeekRevenue > 0 
      ? (((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(1)
      : 0;

    // ============ NEW ANALYTICS ============

    // Average purchase in last 24 hours
    const last24HoursOrders = await Invoice.findAll({
      where: { 
        paymentStatus: 'completed',
        createdAt: { [Op.gte]: last24Hours }
      }
    });
    const last24HoursRevenue = last24HoursOrders.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);
    const avg24Hours = last24HoursOrders.length > 0 
      ? (last24HoursRevenue / last24HoursOrders.length).toFixed(2)
      : '0.00';

    // Today's stats
    const todayOrders = await Invoice.findAll({
      where: { 
        paymentStatus: 'completed',
        createdAt: { [Op.gte]: today }
      }
    });
    const todayRevenue = todayOrders.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);

    // Top Products (most purchased)
    const topProductsData = await InvoiceItem.findAll({
      attributes: [
        'productId',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('subtotal')), 'totalRevenue']
      ],
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'brand', 'pictureUrl', 'price']
      }],
      group: ['productId', 'product.id'],
      order: [[fn('SUM', col('quantity')), 'DESC']],
      limit: 10
    });

    const topProducts = topProductsData.map(item => ({
      id: item.product?.id,
      name: item.product?.name || 'Unknown',
      brand: item.product?.brand,
      pictureUrl: item.product?.pictureUrl,
      price: item.product?.price,
      quantitySold: parseInt(item.dataValues.totalQuantity),
      revenue: parseFloat(item.dataValues.totalRevenue || 0).toFixed(2)
    }));

    // Median of customer payments
    const allPayments = completedOrders
      .map(inv => parseFloat(inv.totalAmount))
      .sort((a, b) => a - b);
    
    let medianPayment = 0;
    if (allPayments.length > 0) {
      const mid = Math.floor(allPayments.length / 2);
      medianPayment = allPayments.length % 2 !== 0
        ? allPayments[mid]
        : (allPayments[mid - 1] + allPayments[mid]) / 2;
    }

    // Low Stock Products
    const lowStock = await Product.findAll({
      where: { stockQuantity: { [Op.lte]: 10 } },
      order: [['stockQuantity', 'ASC']],
      limit: 10
    });

    // Payment Distribution
    const paymentMethods = await Invoice.findAll({
      where: { paymentStatus: 'completed' },
      attributes: [
        'paymentMethod',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('totalAmount')), 'total']
      ],
      group: ['paymentMethod']
    });

    const paymentDistribution = paymentMethods.map(pm => ({
      method: pm.paymentMethod,
      count: parseInt(pm.dataValues.count),
      total: parseFloat(pm.dataValues.total || 0).toFixed(2)
    }));

    // Customer stats
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const newCustomersThisMonth = await User.count({
      where: {
        role: 'customer',
        createdAt: { [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1) }
      }
    });

    // Orders by status
    const pendingOrders = await Invoice.count({ where: { paymentStatus: 'pending' } });
    const completedOrdersCount = await Invoice.count({ where: { paymentStatus: 'completed' } });
    const failedOrders = await Invoice.count({ where: { paymentStatus: 'failed' } });

    // Hourly sales trend (last 24 hours)
    const hourlySales = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - (i - 1) * 60 * 60 * 1000);
      
      const hourOrders = await Invoice.findAll({
        where: {
          paymentStatus: 'completed',
          createdAt: { [Op.gte]: hourStart, [Op.lt]: hourEnd }
        }
      });
      
      const hourRevenue = hourOrders.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);
      
      hourlySales.push({
        hour: hourStart.getHours(),
        orders: hourOrders.length,
        revenue: hourRevenue.toFixed(2)
      });
    }

    // Daily sales trend (last 7 days)
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      
      const dayOrders = await Invoice.findAll({
        where: {
          paymentStatus: 'completed',
          createdAt: { [Op.gte]: dayStart, [Op.lt]: dayEnd }
        }
      });
      
      const dayRevenue = dayOrders.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);
      
      dailySales.push({
        date: dayStart.toISOString().split('T')[0],
        dayName: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayRevenue.toFixed(2)
      });
    }

    res.json({
      // Main KPIs
      totalRevenue: {
        value: totalRevenue.toFixed(2),
        change: parseFloat(revenueChange)
      },
      averageTransaction: {
        value: avgTransaction
      },
      salesGrowth: {
        growthRate: salesGrowth,
        thisWeek: thisWeekRevenue.toFixed(2),
        lastWeek: lastWeekRevenue.toFixed(2)
      },
      
      // New Analytics
      last24Hours: {
        orders: last24HoursOrders.length,
        revenue: last24HoursRevenue.toFixed(2),
        averagePurchase: avg24Hours
      },
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue.toFixed(2)
      },
      medianPayment: medianPayment.toFixed(2),
      
      // Customer stats
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth
      },
      
      // Order stats
      orders: {
        pending: pendingOrders,
        completed: completedOrdersCount,
        failed: failedOrders
      },
      
      // Lists
      topProducts,
      lowStock,
      paymentDistribution,
      
      // Trends
      hourlySales,
      dailySales
    });
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({ error: 'Failed to get KPIs' });
  }
};
