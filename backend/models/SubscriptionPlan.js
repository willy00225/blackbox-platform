const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  name: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.STRING, allowNull: false, defaultValue: 'monthly' },
  price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true },
  features: { 
    type: DataTypes.TEXT,  // Changé de JSON à TEXT pour éviter les problèmes
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('features');
      if (!rawValue) return [];
      try {
        return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      } catch {
        return rawValue.split(',').map(f => f.trim()).filter(Boolean);
      }
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('features', JSON.stringify(value));
      } else if (typeof value === 'string') {
        const arr = value.split(',').map(f => f.trim()).filter(Boolean);
        this.setDataValue('features', JSON.stringify(arr));
      } else {
        this.setDataValue('features', JSON.stringify([]));
      }
    }
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'SubscriptionPlans'
});

module.exports = SubscriptionPlan;