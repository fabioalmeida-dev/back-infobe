exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();

    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('tax_identifier').notNullable().unique();

    table.enum('role', ['ADMIN', 'USER']).notNullable();

    table.string('password').notNullable();
    table.string('salt').notNullable();
    table.integer('salt_rounds').notNullable();


    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
