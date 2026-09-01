const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connexion à PostgreSQL via les variables du .env
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false // Pour éviter de polluer le terminal
  }
);

module.exports = sequelize;