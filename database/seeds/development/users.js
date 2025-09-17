
const { v4: uuidv4 } = require('uuid');


exports.seed = async function (knex) {
  const salt = '$2b$10$se/iRBqHkVG.lJP3giuuIe';
  const saltRounds = 10;
  const passwordHash =
    '$2b$10$se/iRBqHkVG.lJP3giuuIetmM2JKp5RPYqne6sbG9vBmQluU45t0K'; 

  const count = await knex('users').count('* as count').first();

  if (count.count > 0) {
    console.log('Users table is not empty. Skipping seed.');
    return;
  }

  const users = [
    {
      id: uuidv4(),
      name: 'Admin',
      email: 'admin@admin.com.br',
      tax_identifier: '12345678901',
      role: 'ADMIN',
      password: passwordHash,
      salt: salt,
      salt_rounds: saltRounds,
    },
    {
      id: uuidv4(),
      name: 'User',
      email: 'user@user.com.br',
      tax_identifier: '10987654321',
      role: 'USER',
      password: passwordHash,
      salt: salt,
      salt_rounds: saltRounds,
    },
  ];

  await knex('users').insert(users).onConflict('email').ignore();
};
