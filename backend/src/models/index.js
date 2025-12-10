const { Sequelize } = require("sequelize");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions,
  }
);

const db = {
  sequelize,
  Sequelize,
  User: require("./user.model")(sequelize, Sequelize),
  Customer: require("./customer.model")(sequelize, Sequelize),
  Product: require("./product.model")(sequelize, Sequelize),
  Invoice: require("./invoice.model")(sequelize, Sequelize),
  InvoiceItem: require("./invoiceItem.model")(sequelize, Sequelize),
  RefreshToken: require("./refreshToken.model")(sequelize, Sequelize),
};

// Define associations
db.Invoice.belongsTo(db.Customer, { foreignKey: "customerId", as: "customer" });
db.Customer.hasMany(db.Invoice, { foreignKey: "customerId", as: "invoices" });

db.InvoiceItem.belongsTo(db.Invoice, {
  foreignKey: "invoiceId",
  as: "invoice",
});
db.Invoice.hasMany(db.InvoiceItem, { foreignKey: "invoiceId", as: "items" });

db.InvoiceItem.belongsTo(db.Product, {
  foreignKey: "productId",
  as: "product",
});
db.Product.hasMany(db.InvoiceItem, {
  foreignKey: "productId",
  as: "invoiceItems",
});

db.RefreshToken.belongsTo(db.User, { foreignKey: "userId", as: "user" });
db.User.hasMany(db.RefreshToken, { foreignKey: "userId", as: "refreshTokens" });

module.exports = db;
