const { Product } = require("../models");
const { Op } = require("sequelize");
const openFoodFactsService = require("../services/openFoodFacts.service");

exports.getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      minPrice,
      maxPrice,
      lowStock,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      where.category = { [Op.iLike]: `%${category}%` };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    if (lowStock === "true") {
      where.stockQuantity = { [Op.lte]: 10 };
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      products: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.syncWithOpenFoodFacts = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    const productData = await openFoodFactsService.getProductByBarcode(barcode);

    let product = await Product.findOne({ where: { barcode } });

    if (product) {
      await product.update({
        ...productData,
        lastSyncedAt: new Date(),
      });
    } else {
      product = await Product.create({
        ...productData,
        barcode,
        price: 0,
        stockQuantity: 0,
        lastSyncedAt: new Date(),
      });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};
