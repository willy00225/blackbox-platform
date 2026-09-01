const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Video = require('./Video');

const Rating = sequelize.define('Rating', {
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
  stars: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  }
});

// Associations
Rating.belongsTo(User, { foreignKey: 'userId' });
Rating.belongsTo(Video, { foreignKey: 'filmId', as: 'Video' });

module.exports = Rating;