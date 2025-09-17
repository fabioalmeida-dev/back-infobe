exports.up = function (knex) {
  return knex.schema.createTable('module', (table) => {
    table.uuid('id').primary();

    table.string('name').notNullable();

    table.uuid('course_id').references('id').inTable('course').onDelete('CASCADE').notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('module');
};
