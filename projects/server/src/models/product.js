"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init(
    {
      category_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      weight: DataTypes.INTEGER,
      unitOfMeasurement: DataTypes.ENUM("gr", "ml"),
      basePrice: DataTypes.INTEGER,
      storageInstruction: DataTypes.STRING,
      storagePeriod: DataTypes.STRING,
      imgProduct: DataTypes.STRING,
      isRemoved: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
