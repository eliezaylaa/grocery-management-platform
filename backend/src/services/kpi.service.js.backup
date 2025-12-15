const {
  Invoice,
  InvoiceItem,
  Product,
  Customer,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

class KPIService {
  async getTotalRevenue(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const currentRevenue = await Invoice.sum("totalAmount", {
      where: {
        paymentStatus: "completed",
        createdAt: { [Op.gte]: startDate },
      },
    });

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousRevenue = await Invoice.sum("totalAmount", {
      where: {
        paymentStatus: "completed",
        createdAt: {
          [Op.gte]: previousStartDate,
          [Op.lt]: startDate,
        },
      },
    });

    const change = previousRevenue
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    return {
      value: parseFloat(currentRevenue || 0).toFixed(2),
      change: parseFloat(change).toFixed(2),
      period: `Last ${days} days`,
    };
  }

  async getAverageTransactionValue() {
    const avgValue = await Invoice.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("total_amount")), "avgValue"],
      ],
      where: { paymentStatus: "completed" },
      raw: true,
    });

    return {
      value: parseFloat(avgValue.avgValue || 0).toFixed(2),
    };
  }

  async getTopSellingProducts(limit = 10) {
    const topProducts = await InvoiceItem.findAll({
      attributes: [
        "productId",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
        [sequelize.fn("SUM", sequelize.col("subtotal")), "totalRevenue"],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["name", "brand", "pictureUrl"],
        },
      ],
      group: ["productId", "product.id"],
      order: [[sequelize.literal("totalQuantity"), "DESC"]],
      limit,
      raw: false,
    });

    return topProducts.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      brand: item.product.brand,
      pictureUrl: item.product.pictureUrl,
      quantitySold: parseInt(item.get("totalQuantity")),
      revenue: parseFloat(item.get("totalRevenue")).toFixed(2),
    }));
  }

  async getLowStockProducts(threshold = 10) {
    const lowStockProducts = await Product.findAll({
      where: {
        stockQuantity: { [Op.lte]: threshold },
      },
      order: [["stockQuantity", "ASC"]],
      limit: 20,
    });

    return lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      stockQuantity: product.stockQuantity,
      pictureUrl: product.pictureUrl,
    }));
  }

  async getCustomerAcquisitionRate(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const newCustomers = await Customer.count({
      where: {
        createdAt: { [Op.gte]: startDate },
      },
    });

    const dailyRate = (newCustomers / days).toFixed(2);

    return {
      newCustomers,
      dailyRate,
      period: `Last ${days} days`,
    };
  }

  async getSalesGrowthRate(period = "monthly") {
    const now = new Date();
    let currentStart, previousStart, previousEnd;

    if (period === "weekly") {
      currentStart = new Date(now.setDate(now.getDate() - 7));
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
      previousEnd = currentStart;
    } else {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    const currentSales = await Invoice.sum("totalAmount", {
      where: {
        paymentStatus: "completed",
        createdAt: { [Op.gte]: currentStart },
      },
    });

    const previousSales = await Invoice.sum("totalAmount", {
      where: {
        paymentStatus: "completed",
        createdAt: {
          [Op.gte]: previousStart,
          [Op.lte]: previousEnd,
        },
      },
    });

    const growthRate = previousSales
      ? ((currentSales - previousSales) / previousSales) * 100
      : 0;

    return {
      currentSales: parseFloat(currentSales || 0).toFixed(2),
      previousSales: parseFloat(previousSales || 0).toFixed(2),
      growthRate: parseFloat(growthRate).toFixed(2),
      period,
    };
  }

  async getPaymentMethodDistribution() {
    const distribution = await Invoice.findAll({
      attributes: [
        "paymentMethod",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "totalAmount"],
      ],
      where: { paymentStatus: "completed" },
      group: ["paymentMethod"],
      raw: true,
    });

    return distribution.map((item) => ({
      method: item.paymentMethod,
      count: parseInt(item.count),
      totalAmount: parseFloat(item.totalAmount).toFixed(2),
    }));
  }

  async getAllKPIs() {
    const [
      totalRevenue,
      averageTransaction,
      topProducts,
      lowStock,
      customerAcquisition,
      salesGrowth,
      paymentDistribution,
    ] = await Promise.all([
      this.getTotalRevenue(),
      this.getAverageTransactionValue(),
      this.getTopSellingProducts(),
      this.getLowStockProducts(),
      this.getCustomerAcquisitionRate(),
      this.getSalesGrowthRate(),
      this.getPaymentMethodDistribution(),
    ]);

    return {
      totalRevenue,
      averageTransaction,
      topProducts,
      lowStock,
      customerAcquisition,
      salesGrowth,
      paymentDistribution,
    };
  }
}

module.exports = new KPIService();
