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
    await queryInterface.bulkInsert("Discount_Types", [
      {
        type: "Buy one get one",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "Discount by percentage",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "Discount by nominal",
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
    await queryInterface.bulkDelete("Discount_Types", null, {});
  },
};
