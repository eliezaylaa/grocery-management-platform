const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Check if DATABASE_URL exists (for Render/production)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Use individual variables (for local development)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'trinity_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
}

// Import models
const User = require('./user.model')(sequelize);
const Product = require('./product.model')(sequelize);
const Invoice = require('./invoice.model')(sequelize);
const InvoiceItem = require('./invoiceItem.model')(sequelize);
const RefreshToken = require('./refreshToken.model')(sequelize);

// Associations
User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices' });
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

Product.hasMany(InvoiceItem, { foreignKey: 'productId' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Product,
  Invoice,
  InvoiceItem,
  RefreshToken
};
