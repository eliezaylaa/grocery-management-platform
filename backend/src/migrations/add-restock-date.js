'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'restock_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('products', 'restock_quantity', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'restock_date');
    await queryInterface.removeColumn('products', 'restock_quantity');
  }
};
