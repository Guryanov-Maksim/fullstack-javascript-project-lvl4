export const up = (knex) => (
  knex.schema.createTable('tasks_with_labels', (table) => {
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
  })
);

export const down = (knex) => knex.schema.dropTable('tasks');
