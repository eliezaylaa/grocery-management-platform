const { sequelize } = require('./src/models');

async function syncDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected');

    console.log('Syncing database schema...');
    await sequelize.sync({ force: true }); 
    console.log('✅ Database synced');

    console.log('Creating default admin user...');
    const { User } = require('./src/models');
    const bcrypt = require('bcrypt');
    
    await User.create({
      email: 'admin@trinity.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    });

    console.log('✅ Admin user created');
    console.log('\n🎉 Database setup complete!');
    console.log('Login: admin@trinity.com / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncDatabase();
