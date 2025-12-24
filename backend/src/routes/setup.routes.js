const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Temporary route to create admin - DELETE THIS AFTER USE
router.get('/create-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@trinity.com';
    const adminPassword = 'admin123';
    
    let admin = await User.findOne({ where: { email: adminEmail } });
    
    if (admin) {
      await admin.update({ role: 'admin' });
      return res.json({ message: 'Updated existing user to admin', email: adminEmail });
    }
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    });
    
    res.json({ 
      message: 'Admin created successfully',
      email: adminEmail,
      password: adminPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make any user admin by email
router.get('/make-admin/:email', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.params.email } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update({ role: 'admin' });
    res.json({ message: `User ${req.params.email} is now admin` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
