exports.up = function (knex) {
  return knex.schema.createTable('upload', (table) => {
    table.uuid('id').primary();
    table.string('key', 255).notNullable();
    table
      .enum('type', [
        'COVER',
      ])
      .notNullable();

    table.string('file_name').notNullable();
    table.string('file_size').notNullable();

    table.timestamps(true, true);
  });
};


exports.down = function (knex) {
  return knex.schema.dropTable('upload');
};
