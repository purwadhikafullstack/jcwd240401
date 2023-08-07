'use strict';
const {
  Model
} = require('sequelize');
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
  Product.init({
    category_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    unitOfMeasurement: DataTypes.INTEGER,
    basePrice: DataTypes.INTEGER,
    storageInstruction: DataTypes.STRING,
    storagePeriod: DataTypes.STRING,
    imgProduct: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};