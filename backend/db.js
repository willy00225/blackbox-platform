const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// 1. Si on est sur Railway (la variable DATABASE_URL est fournie par Railway)
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Important pour Railway
            }
        }
    });
} 
// 2. Sinon, si on est sur ton PC (développement local)
else {
    sequelize = new Sequelize(
        process.env.DB_NAME, 
        process.env.DB_USER, 
        process.env.DB_PASSWORD, 
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            port: process.env.DB_PORT || 5432,
            logging: false
        }
    );
}

module.exports = sequelize;