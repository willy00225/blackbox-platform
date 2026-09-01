const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Ad = sequelize.define('Ad', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  videoUrl: { type: DataTypes.STRING, allowNull: false },
  rewardCoins: { type: DataTypes.INTEGER, defaultValue: 10 },
  maxPerDay: { type: DataTypes.INTEGER, defaultValue: 3 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'Ads' });

module.exports = Ad;