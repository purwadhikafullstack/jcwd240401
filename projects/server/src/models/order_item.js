"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order_Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order_Item.belongsTo(models.Discount, { foreignKey: "discount_id" });
      Order_Item.belongsTo(models.Order, { foreignKey: "order_id" });
      Order_Item.belongsTo(models.Branch_Product, {
        foreignKey: "branch_product_id",
      });
    }
  }
  Order_Item.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: DataTypes.INTEGER,
      branch_product_id: DataTypes.INTEGER,
      discount_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Order_Item",
    }
  );
  return Order_Item;
};
