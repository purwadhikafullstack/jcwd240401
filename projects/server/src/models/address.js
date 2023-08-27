"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Address.belongsTo(models.User, { foreignKey: "user_id" });
      Address.belongsTo(models.City, { foreignKey: "city_id" });
    }
  }
  Address.init(
    {
      user_id: DataTypes.INTEGER,
      streetName: DataTypes.STRING,
      city_id: DataTypes.INTEGER,
      latitude: DataTypes.STRING,
      longitude: DataTypes.STRING,
      isMain: DataTypes.BOOLEAN,
      addressLabel: DataTypes.ENUM("Home", "Work"),
      receiver: DataTypes.STRING,
      contact: DataTypes.STRING,
      postalCode: DataTypes.INTEGER,
      isRemoved: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Address",
    }
  );
  return Address;
};
