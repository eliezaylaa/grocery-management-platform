const authService = require('../services/auth.service');
const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phoneNumber, address, zipCode, city, country } = req.body;
    
    // Only admins can create staff accounts
    if (role && role !== 'customer') {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can create staff accounts' });
      }
    }

    const user = await authService.register({
      email,
      password,
      role: role || 'customer',
      firstName,
      lastName,
      phoneNumber,
      address,
      zipCode,
      city,
      country
    });

    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, address, zipCode, city, country } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      firstName,
      lastName,
      phoneNumber,
      address,
      zipCode,
      city,
      country
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({ user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
