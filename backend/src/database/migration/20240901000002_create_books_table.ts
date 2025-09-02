import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("book").createTable("books", table => {
    table.uuid("book_id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("title", 500).notNullable();
    table.string("author", 255).notNullable();
    table.string("isbn", 17).unique(); // ISBN-13 format with dashes: 978-0-123-45678-9
    table.integer("pages").unsigned();
    table.decimal("rating", 2, 1).checkBetween([1.0, 5.0]);
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    // Indexes for fast search and pagination
    table.index(["title"], "idx_books_title");
    table.index(["author"], "idx_books_author");
    table.index(["title", "author"], "idx_books_title_author");
    table.index(["created_at"], "idx_books_created_at");
    table.index(["rating"], "idx_books_rating");

    // Composite index for cursor pagination (id + created_at for stable ordering)
    table.index(["created_at", "book_id"], "idx_books_pagination");
  });

  // Create full-text search index using raw SQL
  await knex.raw(`
    CREATE INDEX idx_books_fulltext 
    ON book.books 
    USING GIN (to_tsvector('english', title || ' ' || author))
  `);

  // Create a trigger to automatically update the updated_at timestamp
  await knex.raw(`
    CREATE OR REPLACE FUNCTION book.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON book.books 
    FOR EACH ROW 
    EXECUTE FUNCTION book.update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("DROP TRIGGER IF EXISTS update_books_updated_at ON book.books;");
  await knex.raw("DROP FUNCTION IF EXISTS book.update_updated_at_column();");
  await knex.schema.withSchema("book").dropTableIfExists("books");
}
