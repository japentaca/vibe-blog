import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const config = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../database/blog.db')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, '../migrations')
  },
  seeds: {
    directory: path.join(__dirname, '../seeds')
  },
  pool: {
    afterCreate: (conn, done) => {
      conn.run('PRAGMA foreign_keys = ON', done);
    }
  }
};

// Create database instance
const db = knex(config);

export default db;