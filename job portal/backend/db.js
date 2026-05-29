const { Sequelize } = require('sequelize');
require('dotenv').config();
let sequelize;
if (process.env.DB_ENV == 'dev') {

  sequelize = new Sequelize(process.env.MYSQL_ADDON_URI, {
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 2,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // define: {
    //   underscored: true,     // Converts camelCase → snake_case (createdAt → created_at)
    //   freezeTableName: true, // Prevents pluralizing table names
    //   timestamps: true,      // Automatically adds created_at, updated_at
    //   paranoid: true,        // Adds deleted_at for soft deletes (if you want)
    // },
  });
}
else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'jobmain',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      // Add SSL configuration for PostgreSQL cloud databases
      ...(process.env.DB_DIALECT === 'postgres' && {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      })
    }
  );
}
module.exports = sequelize;  
