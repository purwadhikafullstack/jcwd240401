"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Discount_Type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Discount_Type.hasMany(models.Discount, {
        foreignKey: "discount_type_id",
      });
    }
  }
  Discount_Type.init(
    {
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Discount_Type",
    }
  );
  return Discount_Type;
};
