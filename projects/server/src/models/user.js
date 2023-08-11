"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Address, { foreignKey: "user_id" });
      User.hasMany(models.Order, { foreignKey: "user_id" });
      User.hasOne(models.Branch, { foreignKey: "user_id" });
      User.belongsToMany(models.Voucher, {
        through: models.User_Voucher,
        foreignKey: "user_id",
        otherKey: "voucher_id",
      });
      User.belongsToMany(models.Branch_Product, {
        through: models.Cart,
        foreignKey: "user_id",
        otherKey: "branch_product_id",
      });
    }
  }
  User.init(
    {
      role_id: DataTypes.ENUM("1", "2", "3"),
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      birthdate: DataTypes.DATE,
      gender: DataTypes.ENUM("male", "female"),
      password: DataTypes.STRING,
      referralCode: DataTypes.STRING,
      imgProfile: DataTypes.STRING,
      verificationToken: DataTypes.STRING,
      isVerify: DataTypes.BOOLEAN,
      resetPasswordToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
