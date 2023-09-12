"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsToMany(models.Branch_Product, {
        through: models.Order_Item,
        foreignKey: "order_id",
        otherKey: "branch_product_id",
      });
      Order.belongsTo(models.User, { foreignKey: "user_id" });
      Order.belongsTo(models.Voucher, { foreignKey: "voucher_id" });
    }
  }
  Order.init(
    {
      user_id: DataTypes.INTEGER,
      invoiceCode: DataTypes.STRING,
      orderDate: DataTypes.DATE,
      orderStatus: DataTypes.ENUM(
        "Waiting for payment",
        "Waiting for payment confirmation",
        "Processing",
        "Delivering",
        "Order completed",
        "Canceled"
      ),
      totalPrice: DataTypes.INTEGER,
      addressStreetName: DataTypes.STRING,
      addressCity: DataTypes.STRING,
      addressProvince: DataTypes.STRING,
      addressLabel: DataTypes.ENUM("Home", "Work"),
      receiver: DataTypes.STRING,
      contact: DataTypes.STRING,
      postalCode: DataTypes.INTEGER,
      imgPayment: DataTypes.STRING,
      imgRefund: DataTypes.STRING,
      cancelReason: DataTypes.STRING,
      shippingMethod: DataTypes.STRING,
      shippingDate: DataTypes.DATE,
      shippingCost: DataTypes.INTEGER,
      voucher_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
