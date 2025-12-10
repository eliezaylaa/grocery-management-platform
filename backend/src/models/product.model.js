module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      barcode: {
        type: DataTypes.STRING,
        unique: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      brand: DataTypes.STRING,
      category: DataTypes.STRING,
      pictureUrl: {
        type: DataTypes.STRING,
        field: "picture_url",
      },
      description: DataTypes.TEXT,
      nutritionalInfo: {
        type: DataTypes.JSONB,
        field: "nutritional_info",
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "stock_quantity",
      },
      openFoodFactsId: {
        type: DataTypes.STRING,
        field: "open_food_facts_id",
      },
      lastSyncedAt: {
        type: DataTypes.DATE,
        field: "last_synced_at",
      },
    },
    {
      tableName: "products",
      underscored: true,
    }
  );

  return Product;
};
