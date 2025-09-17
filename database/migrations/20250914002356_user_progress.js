exports.up = function (knex) {
  return knex.schema.createTable('user_progress', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.uuid('course_id').references('id').inTable('course').onDelete('CASCADE').notNullable();
    table.uuid('module_id').references('id').inTable('module').onDelete('CASCADE').notNullable();
    table.uuid('lesson_id').references('id').inTable('lesson').onDelete('CASCADE').notNullable();
    table.integer('percent').notNullable();

    table.boolean('completed').notNullable().defaultTo(false);

    table.timestamps(true, true);
  })
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_progress');
};
