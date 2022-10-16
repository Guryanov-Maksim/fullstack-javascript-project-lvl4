// 1. npx knex init - создает knexfile.js? его содержимое нужно потом немного подстроить
// 2. npx knex migrate:make create_users_table --esm - создает макет миграции, нужно самому написать таблицы 
// 3.  npx knex migrate:up - создает базу и создает в ней таблицу, описанную в migrations

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const migrations = {
  directory: path.join(__dirname, 'server', 'migrations'),
};

export const development = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './default.sqlite'
  },
  pool: {
    afterCreate: (conn, cb) => (
      conn.run('PRAGMA foreign_keys = ON', cb)
    ),
  },
  migrations,
};

export const production = {
  client: 'pg',
  useNullAsDefault: true,
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  migrations,
};

export const test = {
  client: 'sqlite3',
  connection: ':memory:',
  useNullAsDefault: true,
  migrations,
};
  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }

