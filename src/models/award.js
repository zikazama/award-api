'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Award extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Award.init({
    title: DataTypes.STRING,
    poin: DataTypes.INTEGER,
    imageUrl: DataTypes.STRING,
    type: DataTypes.ENUM('vouchers', 'products', 'others')
  }, {
    sequelize,
    modelName: 'Award',
  });
  return Award;
};