"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Voucher.init(
    {
      user_id: DataTypes.INTEGER,
      branch_id: DataTypes.INTEGER,
      voucher_type_id: DataTypes.INTEGER,
      expiredDate: DataTypes.DATE,
      usedLimit: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
      minTransaction: DataTypes.INTEGER,
      maxDiscount: DataTypes.INTEGER,
      isUsed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Voucher",
    }
  );
  return Voucher;
};
