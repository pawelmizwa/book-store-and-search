import { Injectable, Inject, Logger } from "@nestjs/common";
import { BookRepository, PaginatedResult } from "./book.repository";
import { BookEntity } from "./book.entity";
import { CreateBookProperties, BookSearchOptions } from "@book-store/shared";
import { BookNotFoundError, DuplicateIsbnError } from "./errors/book.domain-error";
import { BOOK_REPOSITORY } from "../constants";

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);

  constructor(@Inject(BOOK_REPOSITORY) private readonly bookRepository: BookRepository) {}

  async createBook(book_data: CreateBookProperties): Promise<BookEntity> {
    this.logger.log(`Creating book with title: "${book_data.title}"`, { isbn: book_data.isbn });
    
    try {
      // Check for duplicate ISBN if provided
      if (book_data.isbn) {
        this.logger.debug(`Checking for duplicate ISBN: ${book_data.isbn}`);
        const existingBook = await this.bookRepository.findByIsbn(book_data.isbn);
        if (existingBook) {
          this.logger.warn(`Duplicate ISBN found: ${book_data.isbn}`);
          throw new DuplicateIsbnError(book_data.isbn);
        }
      }

      const result = await this.bookRepository.create(book_data);
      this.logger.log(`Book created successfully with ID: ${result.book_id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create book: ${errorMessage}`, { 
        error: error instanceof Error ? error.stack : String(error), 
        book_data 
      });
      throw error;
    }
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
    this.logger.log(`Searching books with options`, { 
      limit: options.limit, 
      cursor: options.cursor ? 'present' : 'none',
      filters: options.filters,
      sort_by: options.sort_by,
      sort_order: options.sort_order
    });
    
    try {
      const result = await this.bookRepository.search(options);
      this.logger.log(`Search completed successfully`, { 
        resultCount: result.data.length, 
        hasNextPage: result.has_next_page 
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to search books: ${errorMessage}`, { 
        error: error instanceof Error ? error.stack : String(error), 
        options 
      });
      throw error;
    }
  }

  async getTotalBooksCount(): Promise<number> {
    return await this.bookRepository.countAll();
  }
}
