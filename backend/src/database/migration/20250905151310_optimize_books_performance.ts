import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Step 1: Enable required PostgreSQL extensions
  await knex.raw("CREATE EXTENSION IF NOT EXISTS pg_trgm");
  await knex.raw("CREATE EXTENSION IF NOT EXISTS btree_gin");

  // Step 2: Add synthetic sequential primary key for better performance
  // Keep the existing UUID for external references, but use BIGINT for internal operations
  
  // First, drop the existing primary key constraint
  await knex.raw("ALTER TABLE book.books DROP CONSTRAINT books_pkey");
  
  // Add the synthetic sequential ID column (nullable initially)
  await knex.schema.withSchema("book").alterTable("books", table => {
    table.bigInteger("id").nullable();
  });
  
  // Create the sequence and set the default
  await knex.raw("CREATE SEQUENCE book.books_id_seq");
  await knex.raw("ALTER TABLE book.books ALTER COLUMN id SET DEFAULT nextval('book.books_id_seq')");
  await knex.raw("ALTER SEQUENCE book.books_id_seq OWNED BY book.books.id");
  
  // Populate existing rows with sequential IDs using ROW_NUMBER for predictable ordering
  await knex.raw(`
    UPDATE book.books 
    SET id = subquery.row_num
    FROM (
      SELECT book_id, ROW_NUMBER() OVER (ORDER BY created_at, book_id) as row_num
      FROM book.books
    ) subquery
    WHERE book.books.book_id = subquery.book_id
  `);
  
  // Update sequence to continue from the highest assigned ID
  await knex.raw("SELECT setval('book.books_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM book.books), false)");
  
  // Now make the column NOT NULL
  await knex.raw("ALTER TABLE book.books ALTER COLUMN id SET NOT NULL");
  
  // Now make the new id column the primary key
  await knex.raw("ALTER TABLE book.books ADD PRIMARY KEY (id)");
  
  // Make book_id unique but not primary
  await knex.schema.withSchema("book").alterTable("books", table => {
    table.unique(["book_id"]);
  });

  // Step 3: Add trigram indexes for fast ILIKE queries
  await knex.raw(`
    CREATE INDEX idx_books_title_trigram 
    ON book.books USING GIN (title gin_trgm_ops)
  `);

  await knex.raw(`
    CREATE INDEX idx_books_author_trigram 
    ON book.books USING GIN (author gin_trgm_ops)
  `);

  // Step 4: Add composite covering indexes for common query patterns
  
  // For rating-based searches with pagination
  await knex.raw(`
    CREATE INDEX idx_books_rating_pagination
    ON book.books (rating, created_at, id) 
    WHERE rating IS NOT NULL
  `);

  // For title + rating searches
  await knex.raw(`
    CREATE INDEX idx_books_title_rating_search
    ON book.books (title, rating, created_at, id)
    WHERE rating IS NOT NULL
  `);

  // For author + rating searches  
  await knex.raw(`
    CREATE INDEX idx_books_author_rating_search
    ON book.books (author, rating, created_at, id)
    WHERE rating IS NOT NULL
  `);

  // Step 5: Optimize the pagination index to use the new primary key
  await knex.schema.withSchema("book").alterTable("books", table => {
    table.dropIndex(["created_at", "book_id"], "idx_books_pagination");
  });

  await knex.raw(`
    CREATE INDEX idx_books_pagination_optimized
    ON book.books (created_at, id)
  `);

  // Step 6: Add covering index for complex multi-column searches
  await knex.raw(`
    CREATE INDEX idx_books_search_covering
    ON book.books (title, author, rating, created_at, id)
  `);

  // Step 7: Add expression indexes for case-insensitive searches
  await knex.raw(`
    CREATE INDEX idx_books_title_lower
    ON book.books (LOWER(title))
  `);

  await knex.raw(`
    CREATE INDEX idx_books_author_lower  
    ON book.books (LOWER(author))
  `);

  // Step 8: Add partial indexes for commonly filtered data
  
  // Index for recent books (this will be more general - for fast date-based queries)
  await knex.raw(`
    CREATE INDEX idx_books_recent
    ON book.books (created_at DESC, id)
  `);

  // Index for highly rated books (4+ stars)
  await knex.raw(`
    CREATE INDEX idx_books_highly_rated
    ON book.books (rating, created_at, id)
    WHERE rating >= 4.0
  `);

  // Index for books with ISBN (published books)
  await knex.raw(`
    CREATE INDEX idx_books_published
    ON book.books (isbn, created_at, id)
    WHERE isbn IS NOT NULL
  `);

  // Step 9: Optimize the full-text search index with better configuration
  await knex.raw("DROP INDEX IF EXISTS book.idx_books_fulltext");
  
  // Create custom text search configuration for better book search
  await knex.raw(`
    CREATE TEXT SEARCH CONFIGURATION book_search (COPY = english);
    ALTER TEXT SEARCH CONFIGURATION book_search 
    ALTER MAPPING FOR word WITH simple, english_stem;
  `);

  await knex.raw(`
    CREATE INDEX idx_books_fulltext_optimized
    ON book.books 
    USING GIN (to_tsvector('book_search', title || ' ' || author))
  `);

  // Step 10: Add materialized tsvector column for even better FTS performance
  await knex.schema.withSchema("book").alterTable("books", table => {
    table.specificType("search_vector", "tsvector");
  });

  // Populate the search vector
  await knex.raw(`
    UPDATE book.books 
    SET search_vector = to_tsvector('book_search', title || ' ' || author)
  `);

  // Create GIN index on the materialized column
  await knex.raw(`
    CREATE INDEX idx_books_search_vector
    ON book.books USING GIN (search_vector)
  `);

  // Step 11: Create trigger to maintain the search vector
  await knex.raw(`
    CREATE OR REPLACE FUNCTION book.update_search_vector()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.search_vector = to_tsvector('book_search', NEW.title || ' ' || NEW.author);
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    CREATE TRIGGER update_books_search_vector
    BEFORE INSERT OR UPDATE ON book.books
    FOR EACH ROW
    EXECUTE FUNCTION book.update_search_vector();
  `);

  // Step 12: Update table statistics for better query planning
  await knex.raw("ANALYZE book.books");

  // Step 13: Set up table-specific configuration for better performance
  await knex.raw(`
    ALTER TABLE book.books 
    SET (
      fillfactor = 90,
      autovacuum_vacuum_scale_factor = 0.1,
      autovacuum_analyze_scale_factor = 0.05
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remove triggers and functions
  await knex.raw("DROP TRIGGER IF EXISTS update_books_search_vector ON book.books");
  await knex.raw("DROP FUNCTION IF EXISTS book.update_search_vector()");
  
  // Remove custom text search configuration
  await knex.raw("DROP TEXT SEARCH CONFIGURATION IF EXISTS book_search");

  // Remove the search_vector column
  await knex.schema.withSchema("book").alterTable("books", table => {
    table.dropColumn("search_vector");
  });

  // Remove all the new indexes (in reverse order)
  const indexesToDrop = [
    "idx_books_search_vector",
    "idx_books_fulltext_optimized", 
    "idx_books_published",
    "idx_books_highly_rated",
    "idx_books_recent",
    "idx_books_author_lower",
    "idx_books_title_lower",
    "idx_books_search_covering",
    "idx_books_pagination_optimized",
    "idx_books_author_rating_search",
    "idx_books_title_rating_search", 
    "idx_books_rating_pagination",
    "idx_books_author_trigram",
    "idx_books_title_trigram"
  ];

  for (const indexName of indexesToDrop) {
    await knex.raw(`DROP INDEX IF EXISTS book.${indexName}`);
  }

  // Restore the original primary key structure
  // First drop the current primary key on id
  await knex.raw("ALTER TABLE book.books DROP CONSTRAINT books_pkey");
  
  // Drop the unique constraint on book_id
  await knex.schema.withSchema("book").alterTable("books", table => {
    table.dropUnique(["book_id"]);
  });
  
  // Drop the sequence
  await knex.raw("DROP SEQUENCE IF EXISTS book.books_id_seq");
  
  // Drop the id column
  await knex.schema.withSchema("book").alterTable("books", table => {
    table.dropColumn("id");
  });
  
  // Restore book_id as primary key
  await knex.raw("ALTER TABLE book.books ADD PRIMARY KEY (book_id)");

  // Recreate the original pagination index
  await knex.schema.withSchema("book").alterTable("books", table => {
    table.index(["created_at", "book_id"], "idx_books_pagination");
  });

  // Recreate the original full-text search index
  await knex.raw(`
    CREATE INDEX idx_books_fulltext 
    ON book.books 
    USING GIN (to_tsvector('english', title || ' ' || author))
  `);

  // Reset table configuration
  await knex.raw(`
    ALTER TABLE book.books RESET (
      fillfactor,
      autovacuum_vacuum_scale_factor, 
      autovacuum_analyze_scale_factor
    )
  `);
}