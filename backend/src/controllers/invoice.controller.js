const { Invoice, InvoiceItem, Product, Customer } = require("../models");
const { sequelize } = require("../models");

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, method, customerId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.paymentStatus = status;
    if (method) where.paymentMethod = method;
    if (customerId) where.customerId = customerId;

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["firstName", "lastName", "email"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      invoices: rows,
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
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: InvoiceItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { customerId, items, paymentMethod } = req.body;

    let totalAmount = 0;
    const itemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await t.rollback();
        return res
          .status(404)
          .json({ error: `Product ${item.productId} not found` });
      }

      if (product.stockQuantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`,
        });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      itemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      });

      product.stockQuantity -= item.quantity;
      await product.save({ transaction: t });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const invoice = await Invoice.create(
      {
        invoiceNumber,
        customerId,
        totalAmount,
        paymentMethod,
        paymentStatus: "pending",
      },
      { transaction: t }
    );

    for (const itemData of itemsData) {
      await InvoiceItem.create(
        {
          invoiceId: invoice.id,
          ...itemData,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Customer, as: "customer" },
        {
          model: InvoiceItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    res.status(201).json(fullInvoice);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    await invoice.update(req.body);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    await invoice.destroy();
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    next(error);
  }
};
