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
      allowNull: true,
      unique: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pictureUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'picture_url'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nutritionalInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'nutritional_info'
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'stock_quantity'
    },
    openFoodFactsId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'open_food_facts_id'
    },
    lastSyncedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_synced_at'
    }
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true
  });

  return Product;
};
