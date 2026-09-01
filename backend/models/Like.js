const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Like = sequelize.define('Like', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  videoId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Like;