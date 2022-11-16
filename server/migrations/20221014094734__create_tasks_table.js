export const up = async (knex) => {
  const isExist = await knex.schema.hasTable('tasks');

  if (!isExist) {
    return knex.schema.createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('description');
      table
        .integer('status_id')
        .references('id')
        .inTable('statuses')
        .onDelete('RESTRICT');
      table
        .integer('creator_id')
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT');
      table
        .integer('executor_id')
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
};

// export const up = async (knex) => {
//   const isExist = await knex.schema.hasTable('tasks');

//   if (!isExist) {
//     return knex.schema.createTable('tasks', (table) => {
//       table.increments('id').primary();
//       table.string('name');
//       table.string('description');
//       table
//         .integer('status_id')
//         .references('id')
//         .inTable('statuses')
//         .onDelete('RESTRICT');
//       table
//         .integer('creator_id')
//         .references('id')
//         .inTable('users')
//         .onDelete('RESTRICT');
//       table
//         .integer('executor_id')
//         .references('id')
//         .inTable('users')
//         .onDelete('RESTRICT');
//       table.timestamp('created_at').defaultTo(knex.fn.now());
//     });
//   }
// };

// export const up = (knex) => (
//   knex.schema.hasTable('tasks')
//     .then((exists) => {
//       if (!exists) {
//         return false;
//       }
//       return knex.schema.createTable('tasks', (table) => {
//         table.increments('id').primary();
//         table.string('name');
//         table.string('description');
//         table
//           .integer('status_id')
//           .references('id')
//           .inTable('statuses')
//           .onDelete('RESTRICT');
//         table
//           .integer('creator_id')
//           .references('id')
//           .inTable('users')
//           .onDelete('RESTRICT');
//         table
//           .integer('executor_id')
//           .references('id')
//           .inTable('users')
//           .onDelete('RESTRICT');
//         table.timestamp('created_at').defaultTo(knex.fn.now());
//       });
//     })

  // knex.schema.createTable('tasks', (table) => {
  //   table.increments('id').primary();
  //   table.string('name');
  //   table.string('description');
  //   table
  //     .integer('status_id')
  //     .references('id')
  //     .inTable('statuses')
  //     .onDelete('RESTRICT');
  //   table
  //     .integer('creator_id')
  //     .references('id')
  //     .inTable('users')
  //     .onDelete('RESTRICT');
  //   table
  //     .integer('executor_id')
  //     .references('id')
  //     .inTable('users')
  //     .onDelete('RESTRICT');
  //   table.timestamp('created_at').defaultTo(knex.fn.now());
  // })
// );

// export const down = (knex) => knex.schema.dropTable('tasks');
export const down = async (knex) => {
  const isExist = await knex.schema.hasTable('tasks');

  if (!isExist) {
    return knex.schema.dropTable('tasks');
  }
};
// export const down = (knex) => knex.schema.hasTable('tasks')
//   .then((exists) => {
//     if (!exists) {
//       return false;
//     }
//     return knex.schema.dropTable('tasks');
//   });
