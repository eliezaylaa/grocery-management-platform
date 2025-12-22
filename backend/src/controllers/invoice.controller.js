const { Invoice, InvoiceItem, Product, User, sequelize } = require('../models');

exports.getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: invoices, count } = await Invoice.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: InvoiceItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      invoices,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: InvoiceItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId, paymentMethod, paymentStatus, items } = req.body;

    // If customer role, can only create for themselves
    const targetUserId = req.user.role === 'customer' ? req.user.id : (userId || req.user.id);

    let totalAmount = 0;

    // Calculate total and check stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stockQuantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        });
      }

      totalAmount += item.quantity * parseFloat(product.price);
    }

    // Generate invoice number
    const invoiceCount = await Invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      userId: targetUserId,
      totalAmount: totalAmount.toFixed(2),
      paymentMethod: paymentMethod || 'card',
      paymentStatus: paymentStatus || 'pending'
    }, { transaction });

    // Create invoice items and update stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      const unitPrice = parseFloat(product.price);
      const subtotal = item.quantity * unitPrice;

      await InvoiceItem.create({
        invoiceId: invoice.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2)
      }, { transaction });

      await product.update({
        stockQuantity: product.stockQuantity - item.quantity
      }, { transaction });
    }

    await transaction.commit();

    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
        {
          model: InvoiceItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    res.status(201).json({ invoice: fullInvoice });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await invoice.update({ paymentStatus });

    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
        {
          model: InvoiceItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    res.json({ invoice: updatedInvoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await invoice.destroy();
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
