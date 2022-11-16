export const up = (knex) => knex.schema.hasTable('labels')
  .then((exists) => {
    if (!exists) {
      return false;
    }
    return knex.schema.createTable('labels', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  });
// export const up = (knex) => (
//   knex.schema.createTable('labels', (table) => {
//     table.increments('id').primary();
//     table.string('name');
//     table.timestamp('created_at').defaultTo(knex.fn.now());
//   })
// );

export const down = (knex) => knex.schema.hasTable('labels')
  .then((exists) => {
    if (!exists) {
      return false;
    }
    return knex.schema.dropTable('labels');
  });
// export const down = (knex) => knex.schema.dropTable('labels');
