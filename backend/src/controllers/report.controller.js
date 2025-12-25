const { Invoice, InvoiceItem, Product, User } = require("../models");
const { Op, fn, col } = require("sequelize");

exports.getKPIs = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // This week: last 7 days from now
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Last week: 7-14 days ago
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get ALL invoices for payment distribution
    const allInvoices = await Invoice.findAll();

    // Payment Distribution - ALL TIME, ALL INVOICES
    const paymentCounts = {};
    const paymentTotals = {};

    allInvoices.forEach((invoice) => {
      const method = invoice.paymentMethod || "unknown";
      paymentCounts[method] = (paymentCounts[method] || 0) + 1;
      paymentTotals[method] =
        (paymentTotals[method] || 0) + parseFloat(invoice.totalAmount || 0);
    });

    const paymentDistribution = Object.keys(paymentCounts).map((method) => ({
      method: method,
      count: paymentCounts[method],
      total: paymentTotals[method].toFixed(2),
    }));

    // Completed orders for revenue calculations
    const completedOrders = allInvoices.filter(
      (inv) => inv.paymentStatus === "completed"
    );
    const totalRevenue = completedOrders.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0
    );

    // Revenue this month vs last month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthOrders = completedOrders.filter(
      (inv) => new Date(inv.createdAt) >= thisMonthStart
    );
    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0
    );

    const lastMonthOrders = completedOrders.filter((inv) => {
      const d = new Date(inv.createdAt);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0
    );

    const revenueChange =
      lastMonthRevenue > 0
        ? (
            ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
            100
          ).toFixed(1)
        : thisMonthRevenue > 0
        ? 100
        : 0;

    // Average Transaction
    const avgTransaction =
      completedOrders.length > 0
        ? (totalRevenue / completedOrders.length).toFixed(2)
        : "0.00";

    // Sales Growth (this week vs last week) - USE ALL INVOICES
    const thisWeekOrders = allInvoices.filter(
      (inv) => new Date(inv.createdAt) >= thisWeekStart
    );
    const thisWeekRevenue = thisWeekOrders.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0
    );

    const lastWeekOrders = allInvoices.filter((inv) => {
      const d = new Date(inv.createdAt);
      return d >= lastWeekStart && d < lastWeekEnd;
    });
    const lastWeekRevenue = lastWeekOrders.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0
    );

    let salesGrowth = 0;
    if (lastWeekRevenue > 0) {
      salesGrowth = (
        ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) *
        100
      ).toFixed(1);
    } else if (thisWeekRevenue > 0) {
      salesGrowth = 100;
    }

    // Last 24 hours stats
    const last24HoursOrders = allInvoices.filter(
      (inv) => new Date(inv.createdAt) >= last24Hours
    );
    const last24HoursRevenue = last24HoursOrders.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0
    );
    const avg24Hours =
      last24HoursOrders.length > 0
        ? (last24HoursRevenue / last24HoursOrders.length).toFixed(2)
        : "0.00";

    // Today's stats
    const todayOrders = allInvoices.filter(
      (inv) => new Date(inv.createdAt) >= today
    );
    const todayRevenue = todayOrders.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0
    );

    // Top Products
    let topProducts = [];
    try {
      const topProductsData = await InvoiceItem.findAll({
        attributes: [
          "productId",
          [fn("SUM", col("quantity")), "totalQuantity"],
          [fn("SUM", col("subtotal")), "totalRevenue"],
        ],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "brand", "pictureUrl", "price"],
          },
        ],
        group: ["productId", "product.id"],
        order: [[fn("SUM", col("quantity")), "DESC"]],
        limit: 10,
      });

      topProducts = topProductsData.map((item) => ({
        id: item.product?.id,
        name: item.product?.name || "Unknown",
        brand: item.product?.brand,
        pictureUrl: item.product?.pictureUrl,
        price: item.product?.price,
        quantitySold: parseInt(item.dataValues.totalQuantity || 0),
        revenue: parseFloat(item.dataValues.totalRevenue || 0).toFixed(2),
      }));
    } catch (e) {
      console.error("Error fetching top products:", e);
    }

    // Median Payment
    const allPayments = completedOrders
      .map((inv) => parseFloat(inv.totalAmount))
      .sort((a, b) => a - b);

    let medianPayment = 0;
    if (allPayments.length > 0) {
      const mid = Math.floor(allPayments.length / 2);
      medianPayment =
        allPayments.length % 2 !== 0
          ? allPayments[mid]
          : (allPayments[mid - 1] + allPayments[mid]) / 2;
    }

    // Low Stock Products
    const lowStock = await Product.findAll({
      where: { stockQuantity: { [Op.lte]: 10 } },
      order: [["stockQuantity", "ASC"]],
      limit: 10,
    });

    // Customer stats
    const totalCustomers = await User.count({ where: { role: "customer" } });
    const newCustomersThisMonth = await User.count({
      where: {
        role: "customer",
        createdAt: { [Op.gte]: thisMonthStart },
      },
    });

    // Orders by status
    const pendingOrdersCount = allInvoices.filter(
      (inv) => inv.paymentStatus === "pending"
    ).length;
    const completedOrdersCount = completedOrders.length;
    const failedOrdersCount = allInvoices.filter(
      (inv) => inv.paymentStatus === "failed"
    ).length;

    // Daily sales (last 7 days)
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i
      );
      const dayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i + 1
      );

      const dayOrders = allInvoices.filter((inv) => {
        const d = new Date(inv.createdAt);
        return d >= dayStart && d < dayEnd;
      });

      const dayRevenue = dayOrders.reduce(
        (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
        0
      );

      dailySales.push({
        date: dayStart.toISOString().split("T")[0],
        dayName: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
        orders: dayOrders.length,
        revenue: parseFloat(dayRevenue.toFixed(2)),
      });
    }

    res.json({
      totalRevenue: {
        value: totalRevenue.toFixed(2),
        change: parseFloat(revenueChange),
      },
      averageTransaction: {
        value: avgTransaction,
      },
      salesGrowth: {
        growthRate: parseFloat(salesGrowth),
        thisWeek: thisWeekRevenue.toFixed(2),
        lastWeek: lastWeekRevenue.toFixed(2),
      },
      last24Hours: {
        orders: last24HoursOrders.length,
        revenue: last24HoursRevenue.toFixed(2),
        averagePurchase: avg24Hours,
      },
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue.toFixed(2),
      },
      medianPayment: medianPayment.toFixed(2),
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      orders: {
        pending: pendingOrdersCount,
        completed: completedOrdersCount,
        failed: failedOrdersCount,
      },
      topProducts,
      lowStock,
      paymentDistribution,
      dailySales,
    });
  } catch (error) {
    console.error("Get KPIs error:", error);
    res
      .status(500)
      .json({ error: "Failed to get KPIs", details: error.message });
  }
};
