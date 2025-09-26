export const up = function(knex) {
  return knex.schema.createTable('posts', function(table) {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.string('slug', 255).unique().notNullable();
    table.text('content').notNullable();
    table.text('excerpt');
    table.string('featured_image', 500);
    table.string('category', 100);
    table.text('tags');
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
    table.integer('view_count').defaultTo(0);
    table.timestamps(true, true);
    
    // Indexes for better query performance
    table.index('slug');
    table.index('status');
    table.index('category');
    table.index('created_at');
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('posts');
};