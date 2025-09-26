export const up = function(knex) {
  return knex.schema.alterTable('posts', function(table) {
    table.integer('author_id').unsigned().notNullable().defaultTo(1);
    table.foreign('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.index('author_id');
  });
};

export const down = function(knex) {
  return knex.schema.alterTable('posts', function(table) {
    table.dropForeign('author_id');
    table.dropIndex('author_id');
    table.dropColumn('author_id');
  });
};