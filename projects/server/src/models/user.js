'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    role_id: DataTypes.ENUM,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    birthdate: DataTypes.DATE,
    gender: DataTypes.ENUM,
    password: DataTypes.STRING,
    referralCode: DataTypes.STRING,
    imgProfile: DataTypes.STRING,
    verificationToken: DataTypes.STRING,
    isVerify: DataTypes.BOOLEAN,
    resetPasswordToken: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};