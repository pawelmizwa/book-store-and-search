import { describe, it, expect, beforeEach, vi } from "vitest";
import { BookService } from "./book.service";
import { BookRepository } from "./book.repository";
import { BookEntity, CreateBookProperties } from "./book.entity";
import { BookNotFoundError, DuplicateIsbnError } from "./errors/book.domain-error";

describe("BookService", () => {
  let bookService: BookService;
  let bookRepository: BookRepository;

  const mockBook = BookEntity.create({
    title: "Test Book",
    author: "Test Author",
    isbn: "978-0-123-45678-9",
    pages: 100,
    rating: 4.0,
  });

  beforeEach(() => {
    bookRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByIsbn: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
      countAll: vi.fn(),
    } as any;

    bookService = new BookService(bookRepository);
  });

  describe("createBook", () => {
    const createBookData: CreateBookProperties = {
      title: "New Book",
      author: "New Author",
      isbn: "978-0-987-65432-1",
      pages: 200,
      rating: 5.0,
    };

    it("should create a book successfully", async () => {
      vi.mocked(bookRepository.findByIsbn).mockResolvedValue(null);
      vi.mocked(bookRepository.create).mockResolvedValue(mockBook);

      const result = await bookService.createBook(createBookData);

      expect(bookRepository.findByIsbn).toHaveBeenCalledWith(createBookData.isbn);
      expect(bookRepository.create).toHaveBeenCalledWith(createBookData);
      expect(result).toBe(mockBook);
    });

    it("should throw DuplicateIsbnError when ISBN already exists", async () => {
      vi.mocked(bookRepository.findByIsbn).mockResolvedValue(mockBook);

      await expect(bookService.createBook(createBookData)).rejects.toThrow(DuplicateIsbnError);
      expect(bookRepository.findByIsbn).toHaveBeenCalledWith(createBookData.isbn);
      expect(bookRepository.create).not.toHaveBeenCalled();
    });

    it("should create book without ISBN validation when no ISBN provided", async () => {
      const dataWithoutIsbn = { ...createBookData, isbn: undefined };
      vi.mocked(bookRepository.create).mockResolvedValue(mockBook);

      const result = await bookService.createBook(dataWithoutIsbn);

      expect(bookRepository.findByIsbn).not.toHaveBeenCalled();
      expect(bookRepository.create).toHaveBeenCalledWith(dataWithoutIsbn);
      expect(result).toBe(mockBook);
    });
  });

  describe("getBookById", () => {
    const bookId = "test-book-id";

    it("should return book when found", async () => {
      vi.mocked(bookRepository.findById).mockResolvedValue(mockBook);

      const result = await bookService.getBookById(bookId);

      expect(bookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(result).toBe(mockBook);
    });

    it("should throw BookNotFoundError when book not found", async () => {
      vi.mocked(bookRepository.findById).mockResolvedValue(null);

      await expect(bookService.getBookById(bookId)).rejects.toThrow(BookNotFoundError);
      expect(bookRepository.findById).toHaveBeenCalledWith(bookId);
    });
  });

  describe("updateBook", () => {
    const bookId = "test-book-id";
    const updateData = { title: "Updated Title", rating: 3.5 };

    it("should update book successfully", async () => {
      vi.mocked(bookRepository.findById).mockResolvedValue(mockBook);
      vi.mocked(bookRepository.update).mockResolvedValue(mockBook);

      const result = await bookService.updateBook(bookId, updateData);

      expect(bookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(bookRepository.update).toHaveBeenCalledWith(bookId, updateData);
      expect(result).toBe(mockBook);
    });

    it("should throw BookNotFoundError when book not found", async () => {
      vi.mocked(bookRepository.findById).mockResolvedValue(null);

      await expect(bookService.updateBook(bookId, updateData)).rejects.toThrow(BookNotFoundError);
      expect(bookRepository.update).not.toHaveBeenCalled();
    });

    it("should check for duplicate ISBN when updating ISBN", async () => {
      const updateDataWithIsbn = { ...updateData, isbn: "978-0-111-22333-4" };
      const otherBook = BookEntity.create({
        title: "Other",
        author: "Other",
        isbn: "978-0-111-22333-4",
      });

      vi.mocked(bookRepository.findById).mockResolvedValue(mockBook);
      vi.mocked(bookRepository.findByIsbn).mockResolvedValue(otherBook);

      await expect(bookService.updateBook(bookId, updateDataWithIsbn)).rejects.toThrow(
        DuplicateIsbnError
      );
      expect(bookRepository.findByIsbn).toHaveBeenCalledWith(updateDataWithIsbn.isbn);
      expect(bookRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteBook", () => {
    const bookId = "test-book-id";

    it("should delete book successfully", async () => {
      vi.mocked(bookRepository.findById).mockResolvedValue(mockBook);
      vi.mocked(bookRepository.delete).mockResolvedValue();

      await bookService.deleteBook(bookId);

      expect(bookRepository.findById).toHaveBeenCalledWith(bookId);
      expect(bookRepository.delete).toHaveBeenCalledWith(bookId);
    });

    it("should throw BookNotFoundError when book not found", async () => {
      vi.mocked(bookRepository.findById).mockResolvedValue(null);

      await expect(bookService.deleteBook(bookId)).rejects.toThrow(BookNotFoundError);
      expect(bookRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("searchBooks", () => {
    it("should return search results", async () => {
      const searchOptions = { limit: 10, filters: { title: "test" } };
      const searchResult = { data: [mockBook], has_next_page: false };

      vi.mocked(bookRepository.search).mockResolvedValue(searchResult);

      const result = await bookService.searchBooks(searchOptions);

      expect(bookRepository.search).toHaveBeenCalledWith(searchOptions);
      expect(result).toBe(searchResult);
    });
  });

  describe("getTotalBooksCount", () => {
    it("should return total count", async () => {
      const expectedCount = 42;
      vi.mocked(bookRepository.countAll).mockResolvedValue(expectedCount);

      const result = await bookService.getTotalBooksCount();

      expect(bookRepository.countAll).toHaveBeenCalled();
      expect(result).toBe(expectedCount);
    });
  });
});
