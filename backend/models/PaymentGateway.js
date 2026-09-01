const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PaymentGateway = sequelize.define('PaymentGateway', {
  name: { type: DataTypes.STRING, allowNull: false }, // Wave, Orange, etc.
  logo: { type: DataTypes.STRING, allowNull: true }, // URL du logo
  apiKey: { type: DataTypes.STRING, allowNull: true },
  apiSecret: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false }, // Si elle est active
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = PaymentGateway;