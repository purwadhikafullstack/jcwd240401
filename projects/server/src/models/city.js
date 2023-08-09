'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      City.hasOne(models.Branch, {foreignKey: "city_id"}),
      City.belongsTo(models.Province, {foreignKey: "province_id"})
    }
  }
  City.init({
    city_id: {
      type: DataTypes.INTEGER,
      primaryKey: true},
    province_id: DataTypes.INTEGER,
    city_name: DataTypes.STRING,
    postal_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'City',
    timestamps: false,
  });
  return City;
};