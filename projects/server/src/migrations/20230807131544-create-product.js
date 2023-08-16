"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id",
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      weight: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unitOfMeasurement: {
        type: Sequelize.ENUM("gr", "ml"),
        allowNull: false,
      },
      basePrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      storageInstruction: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      storagePeriod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      imgProduct: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isRemoved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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
    await queryInterface.dropTable("Products");
  },
};
