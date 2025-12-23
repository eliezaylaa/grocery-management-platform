const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    barcode: {
      type: DataTypes.STRING,
      unique: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    brand: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.STRING
    },
    pictureUrl: {
      type: DataTypes.STRING,
      field: 'picture_url'
    },
    description: {
      type: DataTypes.TEXT
    },
    nutritionalInfo: {
      type: DataTypes.JSONB,
      field: 'nutritional_info'
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'stock_quantity'
    },
    restockDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'restock_date'
    },
    restockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'restock_quantity'
    },
    openFoodFactsId: {
      type: DataTypes.STRING,
      field: 'open_food_facts_id'
    },
    lastSyncedAt: {
      type: DataTypes.DATE,
      field: 'last_synced_at'
    }
  }, {
    tableName: 'products',
    underscored: true
  });

  return Product;
};
