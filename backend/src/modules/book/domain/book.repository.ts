import { BookEntity } from "./book.entity";
import { CreateBookProperties, BookSearchOptions } from "@book-store/shared";

export interface PaginatedResult<T> {
  data: T[];
  has_next_page: boolean;
  next_cursor?: string;
  total_count?: number;
}

export interface BookRepository {
  create(book_data: CreateBookProperties): Promise<BookEntity>;
  findById(book_id: string): Promise<BookEntity | null>;
  findByIsbn(isbn: string): Promise<BookEntity | null>;
  update(book_id: string, book_data: Partial<CreateBookProperties>): Promise<BookEntity>;
  delete(book_id: string): Promise<void>;
  search(options: BookSearchOptions): Promise<PaginatedResult<BookEntity>>;
  countAll(): Promise<number>;
}
