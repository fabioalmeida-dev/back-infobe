exports.up = async function (knex) {
  await knex.schema.createTable('lesson', (table) => {
    table.uuid('id').primary();

    table.string('name').notNullable();

    table.text('content', 'longtext').notNullable();
    table.integer('minutes').notNullable();

    table.uuid('module_id').references('id').inTable('module').onDelete('CASCADE').notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('lesson');
};