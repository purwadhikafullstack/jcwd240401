"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Stock_History extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Stock_History.belongsTo(models.Branch_Product, {
        foreignKey: "branch_product_id",
      });
    }
  }
  Stock_History.init(
    {
      branch_product_id: DataTypes.INTEGER,
      totalQuantity: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      status: DataTypes.ENUM(
        "restock by admin",
        "canceled by admin",
        "canceled by user",
        "purchased by user",
        "reduced by admin"
      ),
    },
    {
      sequelize,
      modelName: "Stock_History",
    }
  );
  return Stock_History;
};
