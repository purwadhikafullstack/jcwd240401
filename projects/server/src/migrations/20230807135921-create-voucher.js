"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Vouchers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Branches",
          key: "id",
        },
      },
      voucher_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Voucher_Types",
          key: "id",
        },
      },
      expiredDate: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      usedLimit: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      amount: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      minTransaction: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      maxDiscount: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      isReferral: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Vouchers");
  },
};
