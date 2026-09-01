const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User'); // Import nécessaire
const Video = require('./Video'); // Import nécessaire

const Watchlist = sequelize.define('Watchlist', {
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
  }
});

// Associations
Watchlist.belongsTo(User, { foreignKey: 'userId' });
Watchlist.belongsTo(Video, { foreignKey: 'filmId', as: 'Video' });

module.exports = Watchlist;