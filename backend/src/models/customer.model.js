module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    "Customer",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "first_name",
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "last_name",
      },
      phoneNumber: {
        type: DataTypes.STRING,
        field: "phone_number",
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },
      address: DataTypes.STRING,
      zipCode: {
        type: DataTypes.STRING,
        field: "zip_code",
      },
      city: DataTypes.STRING,
      country: DataTypes.STRING,
    },
    {
      tableName: "customers",
      underscored: true,
    }
  );

  return Customer;
};
