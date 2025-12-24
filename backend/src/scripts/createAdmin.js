const { sequelize, User } = require('../models');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Check if admin exists
    let admin = await User.findOne({ where: { email: 'admin@trinity.com' } });
    
    if (admin) {
      // Update to admin role
      await admin.update({ role: 'admin' });
      console.log('✅ Updated existing user to admin');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        email: 'admin@trinity.com',
        password: hashedPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User'
      });
      console.log('✅ Created new admin user');
    }

    console.log('Admin credentials:');
    console.log('  Email: admin@trinity.com');
    console.log('  Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
