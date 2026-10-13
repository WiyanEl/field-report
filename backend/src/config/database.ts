
import knex from "knex";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL belum dikonfigurasi");
}

const db = knex({
  client: "pg",
  connection: {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  },
  pool: {
    min: 0,
    max: 5,
  },
});

export default db;