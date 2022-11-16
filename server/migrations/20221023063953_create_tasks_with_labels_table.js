export const up = (knex) => (
  knex.schema.hasTable('tasks_with_labels')
    .then((exists) => {
      if (!exists) {
        return false;
      }
      return knex.schema.createTable('tasks_with_labels', (table) => {
        table.increments('id').primary();
        table
          .integer('task_id')
          .references('id')
          .inTable('tasks')
          .onDelete('CASCADE')
          .onUpdate('CASCADE');
        table
          .integer('label_id')
          .references('id')
          .inTable('labels')
          .onDelete('RESTRICT');
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    })
  // knex.schema.createTable('tasks_with_labels', (table) => {
  //   table.increments('id').primary();
  //   table
  //     .integer('task_id')
  //     .references('id')
  //     .inTable('tasks')
  //     .onDelete('CASCADE')
  //     .onUpdate('CASCADE');
  //   table
  //     .integer('label_id')
  //     .references('id')
  //     .inTable('labels')
  //     .onDelete('RESTRICT');
  //   table.timestamp('created_at').defaultTo(knex.fn.now());
  // })
);

export const down = (knex) => knex.schema.hasTable('tasks_with_labels')
  .then((exists) => {
    if (!exists) {
      return false;
    }
    return knex.schema.dropTable('tasks_with_labels');
  });
// export const down = (knex) => knex.schema.dropTable('tasks_with_labels');
