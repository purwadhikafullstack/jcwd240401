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
      Voucher.belongsTo(models.Voucher_Type, { foreignKey: "voucher_type_id" });
      Voucher.belongsTo(models.Branch, { foreignKey: "branch_id" });
      Voucher.belongsToMany(models.User, {
        through: models.User_Voucher,
        foreignKey: "voucher_id",
        otherKey: "user_id",
      });
    }
  }
  Voucher.init(
    {
      branch_id: DataTypes.INTEGER,
      voucher_type_id: DataTypes.INTEGER,
      expiredDate: DataTypes.DATE,
      usedLimit: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
      minTransaction: DataTypes.INTEGER,
      maxDiscount: DataTypes.INTEGER,
      isReferral: DataTypes.BOOLEAN,
      isExpired: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: "Voucher",
    }
  );
  return Voucher;
};
