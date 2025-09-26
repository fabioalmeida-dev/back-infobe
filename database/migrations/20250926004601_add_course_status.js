exports.up = async function (knex) {
  await knex.schema.alterTable('course', (table) => {
    table.enu('status', ['DRAFT', 'PUBLISHED']).defaultTo('DRAFT');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('course', (table) => {
    table.dropColumn('status');
  });
};
