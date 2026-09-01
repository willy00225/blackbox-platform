const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User'); // Import nécessaire
const Video = require('./Video'); // Import nécessaire

const WatchHistory = sequelize.define('WatchHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  filmId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  watchedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Associations
WatchHistory.belongsTo(User, { foreignKey: 'userId' });
WatchHistory.belongsTo(Video, { foreignKey: 'filmId', as: 'Video' });

module.exports = WatchHistory;