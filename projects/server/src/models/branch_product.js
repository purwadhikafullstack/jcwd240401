"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Branch_Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Branch_Product.init(
    {
      branch_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      origin: DataTypes.STRING,
      discount_id: DataTypes.INTEGER,
      status: DataTypes.ENUM("ready", "restock", "empty"),
      isRemoved: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Branch_Product",
    }
  );
  return Branch_Product;
};
