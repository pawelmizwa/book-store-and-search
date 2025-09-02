import { z } from "zod";
import { Entity } from "src/core/entity";
import { v4 as uuidv4 } from "uuid";
import { PartialBy } from "src/types";

export const bookEntitySchema = z.object({
  id: z.string().uuid(),
  book_id: z.string().uuid(),
  title: z.string().min(1).max(500),
  author: z.string().min(1).max(255),
  isbn: z.string().min(1).max(50).nullable().optional(),
  pages: z.number().int().positive().nullable().optional(),
  rating: z.number().min(1.0).max(5.0).nullable().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type BookProperties = z.infer<typeof bookEntitySchema>;

export type CreateBookProperties = Pick<
  BookProperties,
  "title" | "author" | "isbn" | "pages" | "rating"
>;

export interface BookSearchFilters {
  title?: string;
  author?: string;
  min_rating?: number;
  max_rating?: number;
  search_query?: string;
}

export interface PaginationOptions {
  limit: number;
  cursor?: string; // base64 encoded cursor for pagination
}

export interface BookSearchOptions extends PaginationOptions {
  filters?: BookSearchFilters;
  sort_by?: "created_at" | "title" | "author" | "rating";
  sort_order?: "asc" | "desc";
}

export class BookEntity extends Entity<BookProperties> {
  constructor(props: BookProperties) {
    super(props, bookEntitySchema);
  }

  static create(props: PartialBy<BookProperties, "id" | "book_id" | "created_at" | "updated_at">) {
    const now = new Date();
    const book_id = uuidv4();
    return new BookEntity({
      id: book_id,
      book_id: book_id,
      created_at: now,
      updated_at: now,
      ...props,
    });
  }

  update(props: Partial<Pick<BookProperties, "title" | "author" | "isbn" | "pages" | "rating">>) {
    const updatedProps = {
      ...this.props,
      ...props,
      updated_at: new Date(),
    };
    return new BookEntity(updatedProps);
  }

  get book_id(): string {
    return this.props.book_id;
  }

  get title(): string {
    return this.props.title;
  }

  get author(): string {
    return this.props.author;
  }

  get isbn(): string | undefined {
    return this.props.isbn ?? undefined;
  }

  get pages(): number | undefined {
    return this.props.pages ?? undefined;
  }

  get rating(): number | undefined {
    return this.props.rating ?? undefined;
  }

  get created_at(): Date {
    return this.props.created_at;
  }

  get updated_at(): Date {
    return this.props.updated_at;
  }
}
