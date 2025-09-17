const dotenv = require('dotenv');
dotenv.config({
  path:
    process.env.NODE_ENV === 'staging'
      ? '.env.staging'
      : process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env',
});

const config = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT || 3306,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    },
    pool: {
      min: 0,
      max: 7,
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'migrations',
    },
    seeds: {
      directory: './database/seeds/development',
    },
  },
  staging: {
    client: 'mysql2',
    connection: {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT || 3306,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    },
    pool: {
      min: 0,
      max: 7,
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'migrations',
    },
    seeds: {
      directory: './database/seeds/development',
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT || 3306,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    },
    pool: {
      min: 0,
      max: 7,
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'migrations',
    },
    seeds: {
      directory: './database/seeds/development',
    },
  },
};

module.exports = config;
