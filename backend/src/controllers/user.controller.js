const { User, Invoice, InvoiceItem, Product } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Get all users
exports.getAll = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Get user by ID with their orders
exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Get user's orders (specific to that user only)
exports.getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Invoice.findAndCountAll({
      where: { userId: id },
      include: [
        {
          model: InvoiceItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Calculate user stats
    const allUserInvoices = await Invoice.findAll({
      where: { userId: id, paymentStatus: 'completed' }
    });

    const totalSpent = allUserInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);
    const totalOrders = allUserInvoices.length;
    const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;

    res.json({
      orders: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      stats: {
        totalSpent: totalSpent.toFixed(2),
        totalOrders,
        averageOrder: averageOrder.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to get user orders' });
  }
};

// Create user
exports.create = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phoneNumber, address, city, zipCode, country } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'customer',
      firstName,
      lastName,
      phoneNumber,
      address,
      city,
      zipCode,
      country
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...updateData } = req.body;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
