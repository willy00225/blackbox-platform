const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Video = sequelize.define('Video', {
  // Champs existants (ne pas toucher)
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  category: { type: DataTypes.ENUM('film', 'serie', 'documentaire'), defaultValue: 'film' },
  episodeNumber: { type: DataTypes.INTEGER, defaultValue: 1 },
  seasonNumber: { type: DataTypes.INTEGER, defaultValue: 1 },
  duration: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  coinsRequired: { type: DataTypes.INTEGER, defaultValue: 0 },
  poster: { type: DataTypes.STRING, allowNull: true },
  year: { type: DataTypes.INTEGER, allowNull: true },
  genre: { type: DataTypes.STRING, allowNull: true },
  casting: { type: DataTypes.TEXT, allowNull: true },
  director: { type: DataTypes.STRING, allowNull: true },
  rating: { type: DataTypes.FLOAT, allowNull: true },

  // Nouveaux champs optionnels (sans impact sur l'existant)
  trailerUrl: { type: DataTypes.STRING, allowNull: true },
  viewsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
  releaseDate: { type: DataTypes.DATEONLY, allowNull: true },
  language: { type: DataTypes.STRING, defaultValue: 'FR' },
  quality: { type: DataTypes.STRING, defaultValue: 'HD' }
}, {
  tableName: 'Videos',
  timestamps: true // ✅ createdAt et updatedAt activés pour un CRUD complet
});

module.exports = Video;