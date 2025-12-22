const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging
  }
);

const db = {
  sequelize,
  Sequelize,
  User: require('./user.model')(sequelize),
  Product: require('./product.model')(sequelize),
  Invoice: require('./invoice.model')(sequelize),
  InvoiceItem: require('./invoiceItem.model')(sequelize),
  RefreshToken: require('./refreshToken.model')(sequelize)
};

// Associations
db.User.hasMany(db.Invoice, {
  foreignKey: 'user_id',
  as: 'invoices'
});

db.Invoice.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});

db.Invoice.hasMany(db.InvoiceItem, {
  foreignKey: 'invoice_id',
  as: 'items'
});

db.InvoiceItem.belongsTo(db.Invoice, {
  foreignKey: 'invoice_id',
  as: 'invoice'
});

db.Product.hasMany(db.InvoiceItem, {
  foreignKey: 'product_id',
  as: 'invoiceItems'
});

db.InvoiceItem.belongsTo(db.Product, {
  foreignKey: 'product_id',
  as: 'product'
});

db.User.hasMany(db.RefreshToken, {
  foreignKey: 'user_id',
  as: 'refreshTokens'
});

db.RefreshToken.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = db;
