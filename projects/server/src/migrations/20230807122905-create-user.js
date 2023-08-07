"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      role_id: {
        type: Sequelize.ENUM("1", "2", "3"),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      birthdate: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      gender: {
        type: Sequelize.ENUM("male", "female"),
        defaultValue: null,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      referralCode: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      imgProfile: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      verificationToken: {
        type: Sequelize.STRING,
        defaultValue: null,
      },
      isVerify: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Users");
  },
};
