const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome TEXT,
      telefone TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS gastos (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER,
      valor NUMERIC,
      categoria TEXT,
      descricao TEXT,
      data TIMESTAMP DEFAULT NOW()
    );
  `);
}

module.exports = { pool, initDB };
