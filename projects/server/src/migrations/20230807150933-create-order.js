"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      invoiceCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      orderStatus: {
        type: Sequelize.ENUM(
          "Waiting for payment",
          "Waiting for payment confirmation",
          "Processing",
          "Delivering",
          "Order completed",
          "Canceled"
        ),
      },
      totalPrice: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      addressStreetName: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      addressCity: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      addressProvince: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      addressLabel: {
        type: Sequelize.ENUM("Home", "Work"),
      },
      receiver: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      postalCode: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      imgPayment: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      imgRefund: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      refundReason: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      shippingMethod: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      shippingDate: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      shippingCost: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      voucher_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
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
    await queryInterface.dropTable("Orders");
  },
};
