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