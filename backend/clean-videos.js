require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false
});

(async () => {
  try {
    await sequelize.query('TRUNCATE TABLE "Videos" RESTART IDENTITY CASCADE');
    console.log('✅ Table Videos nettoyée avec succès.');
  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
})();