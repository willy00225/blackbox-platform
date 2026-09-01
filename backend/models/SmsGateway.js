const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SmsGateway = sequelize.define('SmsGateway', {
  name: { type: DataTypes.STRING, allowNull: false }, // Termii, Twilio, Arkesel...
  logo: { type: DataTypes.STRING, allowNull: true }, // URL du logo
  apiKey: { type: DataTypes.STRING, allowNull: true },
  apiSecret: { type: DataTypes.STRING, allowNull: true },
  senderId: { type: DataTypes.STRING, allowNull: true }, // Nom de l'expéditeur (ex: BlackBox)
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = SmsGateway;