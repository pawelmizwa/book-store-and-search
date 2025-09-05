import { Injectable } from "@nestjs/common";
import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterKnex } from "@nestjs-cls/transactional-adapter-knex";
import { PgRepository } from "src/database/pg-repository";
import { BookRepository, PaginatedResult } from "../domain/book.repository";
import { BookEntity, BookProperties } from "../domain/book.entity";
import { CreateBookProperties, BookSearchOptions } from "@book-store/shared";
import { InvalidCursorError } from "../domain/errors/book.domain-error";

interface CursorData {
  created_at: string;
  book_id: string;
}

@Injectable()
export class BookPgRepository extends PgRepository implements BookRepository {
  protected schema = "book";
  protected tableName = "books";

  constructor(knex: TransactionHost<TransactionalAdapterKnex>) {
    super(knex);
  }

  async create(book_data: CreateBookProperties): Promise<BookEntity> {
    const book = BookEntity.create(book_data);
    // Extract only database columns (exclude 'id' which is just an alias for book_id)
    const { id: _, ...dbProps } = book.props;
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
    let query = this.query.clone();

    // Apply filters
    if (options.filters) {
      const { title, author, min_rating, max_rating, search_query } = options.filters;

      if (title) {
        query = query.where("title", "ilike", `%${title}%`);
      }

      if (author) {
        query = query.where("author", "ilike", `%${author}%`);
      }

      if (min_rating !== undefined) {
        query = query.where("rating", ">=", min_rating);
      }

      if (max_rating !== undefined) {
        query = query.where("rating", "<=", max_rating);
      }

      if (search_query) {
        // Use PostgreSQL full-text search
        query = query.whereRaw(
          "to_tsvector('english', title || ' ' || author) @@ plainto_tsquery('english', ?)",
          [search_query]
        );
      }
    }

    // Handle cursor pagination
    if (options.cursor) {
      const cursorData = this.decodeCursor(options.cursor);
      query = query.where(builder => {
        if (options.sort_order === "desc") {
          builder.where("created_at", "<", cursorData.created_at).orWhere(subBuilder => {
            subBuilder
              .where("created_at", "=", cursorData.created_at)
              .andWhere("book_id", "<", cursorData.book_id);
          });
        } else {
          builder.where("created_at", ">", cursorData.created_at).orWhere(subBuilder => {
            subBuilder
              .where("created_at", "=", cursorData.created_at)
              .andWhere("book_id", ">", cursorData.book_id);
          });
        }
      });
    }

    // Apply sorting
    const sort_by = options.sort_by || "created_at";
    const sort_order = options.sort_order || "desc";

    if (sort_by === "created_at") {
      query = query.orderBy("created_at", sort_order).orderBy("book_id", sort_order);
    } else {
      query = query
        .orderBy(sort_by, sort_order)
        .orderBy("created_at", sort_order)
        .orderBy("book_id", sort_order);
    }

    // Limit + 1 to check if there's a next page
    const limit = Math.min(options.limit, 100); // Cap at 100 for performance
    const rows = await query.limit(limit + 1);

    const has_next_page = rows.length > limit;
    const data = rows.slice(0, limit).map(row => new BookEntity(this.mapRowToEntity(row)));

    let next_cursor: string | undefined;
    if (has_next_page && data.length > 0) {
      const lastBook = data[data.length - 1];
      next_cursor = this.encodeCursor({
        created_at: lastBook.created_at.toISOString(),
        book_id: lastBook.book_id,
      });
    }

    return {
      data,
      has_next_page,
      next_cursor,
    };
  }

  async countAll(): Promise<number> {
    const [{ count }] = await this.query.count("* as count");
    return parseInt(count as string, 10);
  }

  private mapRowToEntity(row: any): BookProperties {
    return {
      id: row.book_id,
      book_id: row.book_id,
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      pages: row.pages,
      rating: row.rating ? parseFloat(row.rating) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  private encodeCursor(data: CursorData): string {
    return Buffer.from(JSON.stringify(data)).toString("base64");
  }

  private decodeCursor(cursor: string): CursorData {
    try {
      const decoded = Buffer.from(cursor, "base64").toString("utf-8");
      const data = JSON.parse(decoded);

      if (!data.created_at || !data.book_id) {
        throw new Error("Invalid cursor format");
      }

      return data;
    } catch (error) {
      throw new InvalidCursorError();
    }
  }
}
