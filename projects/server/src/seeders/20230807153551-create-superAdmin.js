"use strict";

const bcrypt = require("bcryptjs");

const generatePassword = async (PW) => {
  let salt = await bcrypt.genSalt(10);
  let hashed = await bcrypt.hash(PW, salt);
  return hashed;
};

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
    const pw = await generatePassword("!Password1");
    await queryInterface.bulkInsert("Users", [
      {
        role_id: 1,
        name: "super admin 1",
        email: "superadmin1@gmail.com",
        phone: "0877553377",
        password: pw,
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

    await queryInterface.bulkDelete("Users", null, {});
  },
};
