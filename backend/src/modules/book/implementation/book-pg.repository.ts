import { Injectable, Logger } from "@nestjs/common";
import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterKnex } from "@nestjs-cls/transactional-adapter-knex";
import { PgRepository } from "src/database/pg-repository";
import { BookRepository, PaginatedResult } from "../domain/book.repository";
import { BookEntity, BookProperties } from "../domain/book.entity";
import { CreateBookProperties, BookSearchOptions } from "@book-store/shared";
import { InvalidCursorError } from "../domain/errors/book.domain-error";
import { CursorSecurity } from "src/utils/cursor-security";

interface CursorData {
  created_at: string;
  id: number; // Use synthetic primary key for cursor pagination
}

@Injectable()
export class BookPgRepository extends PgRepository implements BookRepository {
  protected schema = "book";
  protected tableName = "books";
  private cursorSecurity = new CursorSecurity();

  constructor(knex: TransactionHost<TransactionalAdapterKnex>) {
    super(knex);
  }

  async create(book_data: CreateBookProperties): Promise<BookEntity> {
    const book = BookEntity.create(book_data);
    // Extract only database columns (exclude synthetic 'id' - it will be auto-generated)
    const { id: _, search_vector: __, ...dbProps } = book.props;
    const [created] = await this.query.insert(dbProps).returning("*");
    return new BookEntity(this.mapRowToEntity(created));
  }

  async findById(book_id: string): Promise<BookEntity | null> {
    const row = await this.query.where({ book_id }).first();
    return row ? new BookEntity(this.mapRowToEntity(row)) : null;
  }

  async findByIsbn(isbn: string): Promise<BookEntity | null> {
    const row = await this.query.where({ isbn }).first();
    return row ? new BookEntity(this.mapRowToEntity(row)) : null;
  }

  async update(book_id: string, book_data: Partial<CreateBookProperties>): Promise<BookEntity> {
    const [updated] = await this.query
      .where({ book_id })
      .update({ ...book_data, updated_at: this.knex.tx.fn.now() })
      .returning("*");
    return new BookEntity(this.mapRowToEntity(updated));
  }

  async delete(book_id: string): Promise<void> {
    await this.query.where({ book_id }).delete();
  }

  async search(options: BookSearchOptions): Promise<PaginatedResult<BookEntity>> {
    this.logger.log(`Starting book search`, { options });
    
    try {
      let query = this.query.clone();
      this.logger.debug(`Base query created for table: ${this.schema}.${this.tableName}`);

    // Apply filters
    if (options.filters) {
      const { title, author, min_rating, max_rating, search_query } = options.filters;

      if (title) {
        // Safe parameterized query for title search
        query = query.where(builder => {
          builder
            .where('title', 'ilike', `%${title}%`)
            .orWhereRaw('title % ?', [title]); // Keep trigram for performance, but safely parameterized
        });
      }

      if (author) {
        // Safe parameterized query for author search
        query = query.where(builder => {
          builder
            .where('author', 'ilike', `%${author}%`)
            .orWhereRaw('author % ?', [author]); // Keep trigram for performance, but safely parameterized
        });
      }

      if (min_rating !== undefined) {
        query = query.where("rating", ">=", min_rating);
      }

      if (max_rating !== undefined) {
        query = query.where("rating", "<=", max_rating);
      }

      if (search_query) {
        // Sanitize search query to prevent injection
        const sanitizedQuery = search_query.replace(/[^\w\s]/g, '');
        if (sanitizedQuery.trim()) {
          // Use safe parameterized full-text search
          query = query.whereRaw(
            "search_vector @@ plainto_tsquery('book_search', ?)",
            [sanitizedQuery]
          );
        }
      }
    }

    // Handle cursor pagination
    if (options.cursor) {
      try {
        const cursorData = this.cursorSecurity.decodeCursor(options.cursor);
        query = query.where(builder => {
          if (options.sort_order === "desc") {
            builder.where("created_at", "<", cursorData.created_at).orWhere(subBuilder => {
              subBuilder
                .where("created_at", "=", cursorData.created_at)
                .andWhere("id", "<", cursorData.id);
            });
          } else {
            builder.where("created_at", ">", cursorData.created_at).orWhere(subBuilder => {
              subBuilder
                .where("created_at", "=", cursorData.created_at)
                .andWhere("id", ">", cursorData.id);
            });
          }
        });
      } catch (error) {
        throw new InvalidCursorError();
      }
    }

    // Apply sorting
    const sort_by = options.sort_by || "created_at";
    const sort_order = options.sort_order || "desc";

    if (sort_by === "created_at") {
      query = query.orderBy("created_at", sort_order).orderBy("id", sort_order);
    } else {
      query = query
        .orderBy(sort_by, sort_order)
        .orderBy("created_at", sort_order)
        .orderBy("id", sort_order);
    }

    // Limit + 1 to check if there's a next page
    const limit = Math.min(options.limit, 100); // Cap at 100 for performance
    this.logger.debug(`Executing query with limit: ${limit + 1}`);
    
    const rows = await query.limit(limit + 1);
    this.logger.debug(`Query executed successfully, returned ${rows.length} rows`);

    const has_next_page = rows.length > limit;
    const data = rows.slice(0, limit).map(row => {
      this.logger.debug(`Mapping row to entity`, { row });
      return new BookEntity(this.mapRowToEntity(row));
    });

    let next_cursor: string | undefined;
    if (has_next_page && data.length > 0) {
      const lastBook = data[data.length - 1];
      next_cursor = this.cursorSecurity.encodeCursor({
        created_at: lastBook.created_at.toISOString(),
        id: lastBook.props.id,
      });
      this.logger.debug(`Generated next cursor`, { next_cursor });
    }

    const result = {
      data,
      has_next_page,
      next_cursor,
    };

    this.logger.log(`Search completed successfully`, { 
      resultCount: data.length, 
      hasNextPage: has_next_page 
    });

    return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database query failed during book search: ${errorMessage}`, { 
        error: error instanceof Error ? error.stack : String(error), 
        options
      });
      throw error;
    }
  }

  async countAll(): Promise<number> {
    const [{ count }] = await this.query.count("* as count");
    return parseInt(count as string, 10);
  }

  private mapRowToEntity(row: any): BookProperties {
    return {
      id: row.id, // Synthetic sequential primary key
      book_id: row.book_id, // UUID for external references
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      pages: row.pages,
      rating: row.rating ? parseFloat(row.rating) : undefined,
      search_vector: row.search_vector || undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

}
