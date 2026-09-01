const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserSubscription = sequelize.define('UserSubscription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  subscription: { type: DataTypes.TEXT, allowNull: false }, // JSON string
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'UserSubscriptions' });

module.exports = UserSubscription;