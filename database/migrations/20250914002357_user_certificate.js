exports.up = function (knex) {
  return knex.schema.createTable('certificate', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.uuid('course_id').references('id').inTable('course').onDelete('CASCADE').notNullable();
    table.string('certificate_key').notNullable().unique();
    table.date('issued_at').nullable();

    table.timestamps(true, true);
  })
};

exports.down = function (knex) {
  return knex.schema.dropTable('certificate');
};
