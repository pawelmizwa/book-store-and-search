export interface Book {
  book_id: string;
  title: string;
  author: string;
  isbn?: string;
  pages?: number;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn?: string;
  pages?: number;
  rating?: number;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  isbn?: string;
  pages?: number;
  rating?: number;
}

export interface BookSearchFilters {
  title?: string;
  author?: string;
  min_rating?: number;
  max_rating?: number;
  search_query?: string;
}

export interface BookSearchParams {
  limit?: number;
  cursor?: string;
  sort_by?: 'created_at' | 'title' | 'author' | 'rating';
  sort_order?: 'asc' | 'desc';
  title?: string;
  author?: string;
  min_rating?: number;
  max_rating?: number;
  search_query?: string;
}

export interface PaginatedBooksResponse {
  data: Book[];
  has_next_page: boolean;
  next_cursor?: string;
}

// Domain entity types for backend
export interface BookEntity {
  id: string;
  book_id: string;
  title: string;
  author: string;
  isbn?: string | null;
  pages?: number | null;
  rating?: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBookProperties {
  title: string;
  author: string;
  isbn?: string | null;
  pages?: number | null;
  rating?: number | null;
}

// Alternative type using Pick for type safety
export type CreateBookEntityProperties = Pick<
  BookEntity,
  "title" | "author" | "isbn" | "pages" | "rating"
>;

export interface PaginationOptions {
  limit: number;
  cursor?: string;
}

export interface BookSearchOptions extends PaginationOptions {
  filters?: BookSearchFilters;
  sort_by?: 'created_at' | 'title' | 'author' | 'rating';
  sort_order?: 'asc' | 'desc';
}
