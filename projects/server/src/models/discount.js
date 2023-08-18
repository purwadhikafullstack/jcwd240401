"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Discount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Discount.belongsTo(models.Discount_Type, {
        foreignKey: "discount_type_id",
      });
      Discount.hasMany(models.Branch_Product, { foreignKey: "discount_id" });
      Discount.hasMany(models.Order_Item, { foreignKey: "discount_id" });
    }
  }
  Discount.init(
    {
      branch_id: DataTypes.INTEGER,
      discount_type_id: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
      expiredDate: DataTypes.DATE,
      isExpired: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Discount",
    }
  );
  return Discount;
};
