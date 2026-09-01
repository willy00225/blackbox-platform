// models/Settings.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Settings = sequelize.define('Settings', {
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  value: { type: DataTypes.TEXT, allowNull: false }
});
module.exports = Settings;