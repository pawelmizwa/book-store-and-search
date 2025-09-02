import { ApiClient } from './base/base-api-client';
import { Book, CreateBookRequest, UpdateBookRequest, BookSearchParams, PaginatedBooksResponse } from '../types/book.types';

export class BooksClient extends ApiClient {
  private readonly booksPath = '/books';

  async createBook(book_data: CreateBookRequest): Promise<Book> {
    return this.post<Book>(this.booksPath, book_data);
  }

  async getBookById(book_id: string): Promise<Book> {
    return this.get<Book>(`${this.booksPath}/${book_id}`);
  }

  async updateBook(book_id: string, book_data: UpdateBookRequest): Promise<Book> {
    return this.put<Book>(`${this.booksPath}/${book_id}`, book_data);
  }

  async deleteBook(book_id: string): Promise<void> {
    return this.delete(`${this.booksPath}/${book_id}`);
  }

  async searchBooks(params: BookSearchParams = {}): Promise<PaginatedBooksResponse> {
    const searchParams = new URLSearchParams();
    
    // Add all defined parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `${this.booksPath}/search?${queryString}` : `${this.booksPath}/search`;
    
    return this.get<PaginatedBooksResponse>(url);
  }

  async getAllBooks(params: BookSearchParams = {}): Promise<PaginatedBooksResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `${this.booksPath}?${queryString}` : this.booksPath;
    
    return this.get<PaginatedBooksResponse>(url);
  }
}