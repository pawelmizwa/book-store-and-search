import { Injectable, Inject } from "@nestjs/common";
import { BookRepository, PaginatedResult } from "./book.repository";
import { BookEntity } from "./book.entity";
import { CreateBookProperties, BookSearchOptions } from "@book-store/shared";
import { BookNotFoundError, DuplicateIsbnError } from "./errors/book.domain-error";
import { BOOK_REPOSITORY } from "../constants";

@Injectable()
export class BookService {
  constructor(@Inject(BOOK_REPOSITORY) private readonly bookRepository: BookRepository) {}

  async createBook(book_data: CreateBookProperties): Promise<BookEntity> {
    // Check for duplicate ISBN if provided
    if (book_data.isbn) {
      const existingBook = await this.bookRepository.findByIsbn(book_data.isbn);
      if (existingBook) {
        throw new DuplicateIsbnError(book_data.isbn);
      }
    }

    return await this.bookRepository.create(book_data);
  }

  async getBookById(book_id: string): Promise<BookEntity> {
    const book = await this.bookRepository.findById(book_id);
    if (!book) {
      throw new BookNotFoundError(book_id);
    }
    return book;
  }

  async updateBook(book_id: string, book_data: Partial<CreateBookProperties>): Promise<BookEntity> {
    // Check if book exists
    await this.getBookById(book_id);

    // Check for duplicate ISBN if updating ISBN
    if (book_data.isbn) {
      const existingBook = await this.bookRepository.findByIsbn(book_data.isbn);
      if (existingBook && existingBook.book_id !== book_id) {
        throw new DuplicateIsbnError(book_data.isbn);
      }
    }

    return await this.bookRepository.update(book_id, book_data);
  }

  async deleteBook(book_id: string): Promise<void> {
    // Check if book exists
    await this.getBookById(book_id);

    await this.bookRepository.delete(book_id);
  }

  async searchBooks(options: BookSearchOptions): Promise<PaginatedResult<BookEntity>> {
    return await this.bookRepository.search(options);
  }

  async getTotalBooksCount(): Promise<number> {
    return await this.bookRepository.countAll();
  }
}
