"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("Voucher_types", [
      {
        type: "ongkir",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "pembelanjaan %",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "pembelanjaan nominal",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Voucher_types", null, {});
  },
};
