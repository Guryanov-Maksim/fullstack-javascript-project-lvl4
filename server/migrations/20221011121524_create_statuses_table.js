export const up = (knex) => knex.schema.hasTable('statuses')
  .then((exists) => {
    if (!exists) {
      return false;
    }
    return knex.schema.createTable('statuses', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  });
// export const up = (knex) => (
//   knex.schema.createTable('statuses', (table) => {
//     table.increments('id').primary();
//     table.string('name');
//     table.timestamp('created_at').defaultTo(knex.fn.now());
//   })
// );

export const down = (knex) => knex.schema.hasTable('statuses')
  .then((exists) => {
    if (!exists) {
      return false;
    }
    return knex.schema.dropTable('statuses');
  });
// export const down = (knex) => knex.schema.dropTable('statuses');
