# 🚀 Performance Architecture Guide

Enterprise-scale architecture designed for **10+ million book records** with optimized search performance.

## 🏗️ Architecture Design

### 1. Dual Primary Key Strategy

The database uses a sophisticated dual primary key approach that combines the benefits of sequential performance with external API compatibility:
```sql
-- Current optimized structure
CREATE TABLE book.books (
  id BIGSERIAL PRIMARY KEY,           -- Fast sequential operations
  book_id UUID UNIQUE NOT NULL,       -- External API compatibility
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255) NOT NULL,
  search_vector TSVECTOR,             -- Materialized full-text search
  -- ... other columns
);
```

**Benefits**: Sequential inserts prevent fragmentation, compact BIGINT indexes, O(1) pagination, external UUID compatibility.

### 2. Advanced Indexing Strategy

#### Trigram Indexes for Partial Text Search
```sql
-- Enable PostgreSQL trigram extension
CREATE EXTENSION pg_trgm;

-- Lightning-fast partial matching
CREATE INDEX CONCURRENTLY idx_books_title_trigram 
ON book.books USING GIN (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY idx_books_author_trigram 
ON book.books USING GIN (author gin_trgm_ops);
```

Enables fast partial text matching with `ILIKE` and fuzzy search with trigram similarity.

#### Composite Covering Indexes
```sql
-- Eliminates table lookups for common query patterns
CREATE INDEX CONCURRENTLY idx_books_search_covering
ON book.books (title, author, rating, created_at, id);

-- Optimized rating-based searches with pagination
CREATE INDEX CONCURRENTLY idx_books_rating_pagination
ON book.books (rating, created_at, id) 
WHERE rating IS NOT NULL;
```

Eliminates table lookups for common queries with complete column coverage.

#### Partial Indexes for Hot Data
```sql
-- Recent books (accessed 80% of the time)
CREATE INDEX CONCURRENTLY idx_books_recent
ON book.books (created_at, id)
WHERE created_at > NOW() - INTERVAL '30 days';

-- Highly rated books (popular searches)
CREATE INDEX CONCURRENTLY idx_books_highly_rated
ON book.books (rating, created_at, id)
WHERE rating >= 4.0;
```

Indexes only relevant data for efficiency and faster maintenance.

#### Expression Indexes for Case-Insensitive Search
```sql
-- Optimized case-insensitive searches
CREATE INDEX CONCURRENTLY idx_books_title_lower
ON book.books (LOWER(title));

CREATE INDEX CONCURRENTLY idx_books_author_lower  
ON book.books (LOWER(author));
```

### 3. Full-Text Search Optimization

#### Materialized Search Vector
```sql
-- Pre-computed search vectors for instant FTS
ALTER TABLE book.books ADD COLUMN search_vector TSVECTOR;

-- Custom text search configuration for books
CREATE TEXT SEARCH CONFIGURATION book_search (COPY = english);
ALTER TEXT SEARCH CONFIGURATION book_search 
ALTER MAPPING FOR word WITH simple, english_stem;

-- Populate and maintain search vectors
UPDATE book.books 
SET search_vector = to_tsvector('book_search', title || ' ' || author);

CREATE INDEX CONCURRENTLY idx_books_search_vector
ON book.books USING GIN (search_vector);
```

#### Auto-Update Trigger
```sql
-- Automatically maintain search vectors
CREATE OR REPLACE FUNCTION book.update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('book_search', NEW.title || ' ' || NEW.author);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_search_vector
BEFORE INSERT OR UPDATE ON book.books
FOR EACH ROW EXECUTE FUNCTION book.update_search_vector();
```

Pre-computed search vectors with automatic maintenance and book-specific text configuration.

### 4. Query Optimization

#### Repository-Level Optimizations

The current query implementation leverages advanced PostgreSQL features for optimal performance with enterprise security:

```typescript
// Secure trigram + case-insensitive search with parameterized queries
query.where(builder => {
  builder
    .where('title', 'ilike', `%${title}%`)
    .orWhereRaw('title % ?', [title]); // Safe parameterized trigram search
});

// Secure materialized search vector with input sanitization
const sanitizedQuery = search_query.replace(/[^\w\s]/g, '');
if (sanitizedQuery.trim()) {
  query.whereRaw(
    "search_vector @@ plainto_tsquery('book_search', ?)",
    [sanitizedQuery]
  );
}
```

#### Secure Cursor Pagination Architecture
```typescript
// Uses synthetic sequential ID for stable, fast pagination with HMAC security
interface CursorData {
  created_at: string;
  id: number; // Sequential ID enables O(1) pagination
}

// Enterprise-grade signed cursors prevent tampering
class CursorSecurity {
  private readonly secret: string;
  private readonly maxAge: number = 24 * 60 * 60 * 1000; // 24 hours
  
  encodeCursor(data: CursorData): string {
    const timestamp = Date.now();
    const payload = JSON.stringify({ data, timestamp });
    const signature = createHmac('sha256', this.secret).update(payload).digest('hex');
    return Buffer.from(JSON.stringify({ data, signature, timestamp })).toString('base64');
  }
}

// Current pagination implementation
query
  .orderBy("created_at", sort_order)
  .orderBy("id", sort_order) // Stable secondary sort
  .where(builder => {
    if (sort_order === "desc") {
      builder
        .where("created_at", "<", cursorData.created_at)
        .orWhere(subBuilder => {
          subBuilder
            .where("created_at", "=", cursorData.created_at)
            .andWhere("id", "<", cursorData.id);
        });
    }
    // ... ascending logic
  });
```

### 5. Database-Level Optimizations

#### Table Configuration
```sql
-- Optimized storage and maintenance
ALTER TABLE book.books SET (
  fillfactor = 90,                          -- Leave space for updates
  autovacuum_vacuum_scale_factor = 0.1,     -- More aggressive cleanup
  autovacuum_analyze_scale_factor = 0.05    -- Better statistics
);
```

#### Memory and Cache Settings
```sql
-- PostgreSQL configuration for large datasets
shared_buffers = '2GB'                     -- Cache hot data
effective_cache_size = '8GB'               -- Total available cache
work_mem = '256MB'                         -- Sort/hash operations
maintenance_work_mem = '1GB'               -- Index maintenance
random_page_cost = 1.1                     -- SSD optimization
```

## 🔧 Implementation Guide

### Migration Implementation

The enterprise-scale architecture is implemented in migration `20250905151310_optimize_books_performance.ts`:

```bash
# Apply enterprise architecture
cd backend
npx knex migrate:latest
```

Uses `CREATE INDEX CONCURRENTLY` for zero-downtime deployment with full backward compatibility.

## Key Implementation Points

### Essential Architecture
1. **Dual Primary Key Strategy** - Sequential ID + UUID for performance and compatibility
2. **Advanced Indexing** - Trigram, covering, and partial indexes
3. **Materialized Full-Text Search** - Pre-computed search vectors
4. **Secure Parameterized Queries** - All user input properly sanitized

### Critical Migration
Apply enterprise architecture with:
```bash
cd backend && npx knex migrate:latest
```

This migration implements the dual primary key strategy, specialized indexes, and materialized search vectors required for enterprise-scale performance.
