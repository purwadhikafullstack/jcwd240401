"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User_Voucher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_Voucher.belongsTo(models.User, { foreignKey: "user_id" });
      User_Voucher.belongsTo(models.Voucher, {
        foreignKey: "voucher_id",
      });
    }
  }
  User_Voucher.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: DataTypes.INTEGER,
      voucher_id: DataTypes.INTEGER,
      isUsed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "User_Voucher",
    }
  );
  return User_Voucher;
};
