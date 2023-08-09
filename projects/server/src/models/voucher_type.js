"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Voucher_Type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Voucher_Type.hasMany(models.Voucher, { foreignKey: "voucher_type_id" });
    }
  }
  Voucher_Type.init(
    {
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Voucher_Type",
    }
  );
  return Voucher_Type;
};
