
require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 0,
      max: 5
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
      loadExtensions: [".ts"],
      tableName: "knex_migrations"
    }
  }
};