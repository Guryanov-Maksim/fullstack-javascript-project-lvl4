export const up = (knex) => (
  Promise.all([
    knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('first_name');
      table.string('last_name');
      table.string('email');
      table.string('password_digest');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('statuses', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    }),
  ])
);

export const down = (knex) => (
  Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('statuses'),
  ])
);
