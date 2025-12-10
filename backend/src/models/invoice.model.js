module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    "Invoice",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "invoice_number",
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "customer_id",
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "total_amount",
      },
      paymentMethod: {
        type: DataTypes.ENUM("cash", "card", "paypal"),
        defaultValue: "cash",
        field: "payment_method",
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
        defaultValue: "pending",
        field: "payment_status",
      },
      paypalTransactionId: {
        type: DataTypes.STRING,
        field: "paypal_transaction_id",
      },
    },
    {
      tableName: "invoices",
      underscored: true,
    }
  );

  return Invoice;
};
