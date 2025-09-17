exports.up = function (knex) {
  return knex.schema.createTable('course', (table) => {
    table.uuid('id').primary();

    table.string('name').notNullable();
    table.string('cover_key').notNullable().unique();


    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('course');
};
