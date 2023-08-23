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
      Branch_Product.belongsToMany(models.User, {
        through: models.Cart,
        foreignKey: "branch_product_id",
        otherKey: "user_id",
      });
      Branch_Product.belongsTo(models.Branch, { foreignKey: "branch_id" });
      Branch_Product.belongsTo(models.Product, { foreignKey: "product_id" });
      Branch_Product.belongsTo(models.Discount, { foreignKey: "discount_id" });
      Branch_Product.hasMany(models.Stock_History, {
        foreignKey: "branch_product_id",
      });
      Branch_Product.belongsToMany(models.Order, {
        through: models.Order_Item,
        foreignKey: "branch_product_id",
        otherKey: "order_id",
      });
    }
  }
  Branch_Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
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
