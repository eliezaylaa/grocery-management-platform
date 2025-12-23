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
      brand,
      minPrice,
      maxPrice,
      lowStock,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      where.category = { [Op.iLike]: `%${category}%` };
    }

    if (brand) {
      where.brand = { [Op.iLike]: `%${brand}%` };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (lowStock === "true") {
      where.stockQuantity = { [Op.lte]: 10 };
    } else if (inStock === "true") {
      where.stockQuantity = { [Op.gt]: 0 };
    } else if (inStock === "false") {
      where.stockQuantity = { [Op.eq]: 0 };
    }

    const validSortFields = ['name', 'price', 'stockQuantity', 'createdAt', 'brand', 'category'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[orderField, orderDirection]],
    });

    const categories = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('category')), 'category']],
      where: { category: { [Op.ne]: null } },
      raw: true,
    });

    const brands = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('brand')), 'brand']],
      where: { brand: { [Op.ne]: null } },
      raw: true,
    });

    res.json({
      products: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      filters: {
        categories: categories.map(c => c.category).filter(Boolean),
        brands: brands.map(b => b.brand).filter(Boolean),
      }
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

exports.searchOpenFoodFacts = async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;
    
    console.log("Search request received:", { query, page });
    
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const result = await openFoodFactsService.searchProducts(query, page);
    console.log("Search result:", { count: result.products.length });
    
    res.json(result);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.bulkImportFromOpenFoodFacts = async (req, res, next) => {
  try {
    const { barcodes } = req.body;
    
    if (!barcodes || !Array.isArray(barcodes)) {
      return res.status(400).json({ error: "Array of barcodes is required" });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const barcode of barcodes) {
      try {
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
            price: (Math.random() * 20 + 1).toFixed(2),
            stockQuantity: Math.floor(Math.random() * 50),
            lastSyncedAt: new Date(),
          });
        }
        
        results.success.push({ barcode, product });
      } catch (error) {
        results.failed.push({ barcode, error: error.message });
      }
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
};
