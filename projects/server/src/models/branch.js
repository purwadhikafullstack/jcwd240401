"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Branch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Branch.belongsTo(models.City, { foreignKey: "city_id" });
      Branch.hasMany(models.Voucher, { foreignKey: "branch_id" });
      Branch.belongsTo(models.User, { foreignKey: "user_id" });
      Branch.belongsToMany(models.Product, {
        through: models.Branch_Product,
        foreignKey: "branch_id",
        otherKey: "product_id",
      });
    }
  }
  Branch.init(
    {
      user_id: DataTypes.INTEGER,
      streetName: DataTypes.STRING,
      postalCode: DataTypes.INTEGER,
      city_id: DataTypes.INTEGER,
      latitude: DataTypes.STRING,
      longitude: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Branch",
    }
  );
  return Branch;
};
