const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'invoice_number'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'paypal'),
      defaultValue: 'card',
      field: 'payment_method'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
      field: 'payment_status'
    },
    paypalTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'paypal_transaction_id'
    }
  }, {
    tableName: 'invoices',
    timestamps: true,
    underscored: true
  });

  return Invoice;
};
