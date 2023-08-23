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
        type: "Free shipping",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "Percentage",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "Nominal",
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
