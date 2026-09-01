const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  // === Identifiants de connexion ===
  email: {
    type: DataTypes.STRING,
    allowNull: true,           // Peut être vide si on utilise le téléphone
    unique: true,
    validate: {
      isEmail: true            // Valide le format si fourni
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,           // Peut être vide si on utilise l'email
    unique: true
  },
  countryCode: {
    type: DataTypes.STRING,
    allowNull: true,           // Ex: '+225', '+33', '+1'
    defaultValue: '+225'
  },

  // === Authentification / sécurité ===
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tokenVersion: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  // === Vérifications ===
  isPhoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // === Informations personnelles ===
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // === Portefeuille & abonnement ===
  blackCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  subscription: {
    type: DataTypes.ENUM('weekly', 'monthly', 'annual', 'none'), // ✅ 'monthly' ajouté
    defaultValue: 'none'
  },
  subscriptionStatus: {
    type: DataTypes.STRING,
    defaultValue: 'inactive' // 'active', 'inactive', 'expired'
  },
  subscriptionExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // === Parrainage ===
  referralCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  referredBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // === Préférences ===
  language: {
    type: DataTypes.STRING,
    defaultValue: 'fr'
  },
  videoQuality: {
    type: DataTypes.STRING,
    defaultValue: 'auto'
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Hook avant création
User.beforeCreate(async (user) => {
  // Hachage du mot de passe
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  // Génération d'un code de parrainage unique
  if (!user.referralCode) {
    user.referralCode = 'BB' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Fusion du code pays avec le numéro si nécessaire
  if (user.phone && user.countryCode && !user.phone.startsWith('+')) {
    user.phone = user.countryCode + user.phone;
  }
});

module.exports = User;