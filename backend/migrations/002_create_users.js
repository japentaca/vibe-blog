export const up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 100).unique().notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('display_name', 150);
    table.text('bio');
    table.string('avatar', 500);
    table.enum('role', ['admin', 'editor', 'author']).defaultTo('author');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Indexes for better query performance
    table.index('username');
    table.index('email');
    table.index('role');
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('users');
};