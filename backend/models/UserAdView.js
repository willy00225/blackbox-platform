const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserAdView = sequelize.define('UserAdView', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  adId: { type: DataTypes.INTEGER, allowNull: false },
  watchedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'UserAdViews' });

module.exports = UserAdView;