import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { BookPgRepository } from "./book-pg.repository";
import { BookEntity } from "../domain/book.entity";
import { CreateBookProperties, BookSearchOptions } from "@book-store/shared";
import { InvalidCursorError } from "../domain/errors/book.domain-error";

// Create a chainable query builder mock
const createQueryBuilder = () => {
  const queryBuilder = {
    insert: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    first: vi.fn(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn(),
    clone: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    count: vi.fn(),
    returning: vi.fn(),
    whereRaw: vi.fn().mockReturnThis(),
    orWhere: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    withSchema: vi.fn().mockReturnThis(),
    table: vi.fn().mockReturnThis(),
  };
  return queryBuilder;
};

describe("BookPgRepository", () => {
  let repository: BookPgRepository;
  let queryBuilder: ReturnType<typeof createQueryBuilder>;
  let mockTransactionHost: any;

  const mockBookData: CreateBookProperties = {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    pages: 180,
    rating: 4.5,
  };

  const mockDbRow = {
    id: 1, // Synthetic sequential primary key
    book_id: "550e8400-e29b-41d4-a716-446655440000",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    pages: 180,
    rating: "4.5",
    search_vector: "'gatsby':1 'great':2 'scott':3 'fitzgerald':4", // Materialized tsvector
    created_at: "2024-01-01T12:00:00Z",
    updated_at: "2024-01-01T12:00:00Z",
  };

  beforeEach(() => {
    queryBuilder = createQueryBuilder();
    
    // Mock the transaction host with proper knex structure
    mockTransactionHost = {
      tx: {
        withSchema: vi.fn().mockReturnValue({
          table: vi.fn().mockReturnValue(queryBuilder),
        }),
        fn: {
          now: vi.fn(() => new Date("2024-01-01T12:00:00Z")),
        },
      },
    };
    
    repository = new BookPgRepository(mockTransactionHost);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("create", () => {
    it("should create a new book successfully", async () => {
      queryBuilder.returning.mockResolvedValue([mockDbRow]);

      const result = await repository.create(mockBookData);

      expect(queryBuilder.insert).toHaveBeenCalled();
      expect(queryBuilder.returning).toHaveBeenCalledWith("*");
      expect(result).toBeInstanceOf(BookEntity);
      expect(result.title).toBe(mockBookData.title);
      expect(result.author).toBe(mockBookData.author);
    });

    it("should exclude id field when inserting", async () => {
      queryBuilder.returning.mockResolvedValue([mockDbRow]);

      await repository.create(mockBookData);

      const insertCall = queryBuilder.insert.mock.calls[0][0];
      expect(insertCall).not.toHaveProperty("id");
      expect(insertCall).toHaveProperty("book_id");
    });
  });

  describe("findById", () => {
    it("should find a book by ID", async () => {
      queryBuilder.first.mockResolvedValue(mockDbRow);

      const result = await repository.findById(mockDbRow.book_id);

      expect(queryBuilder.where).toHaveBeenCalledWith({ book_id: mockDbRow.book_id });
      expect(queryBuilder.first).toHaveBeenCalled();
      expect(result).toBeInstanceOf(BookEntity);
      expect(result?.book_id).toBe(mockDbRow.book_id);
    });

    it("should return null when book not found", async () => {
      queryBuilder.first.mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByIsbn", () => {
    it("should find a book by ISBN", async () => {
      queryBuilder.first.mockResolvedValue(mockDbRow);

      const result = await repository.findByIsbn(mockBookData.isbn!);

      expect(queryBuilder.where).toHaveBeenCalledWith({ isbn: mockBookData.isbn });
      expect(queryBuilder.first).toHaveBeenCalled();
      expect(result).toBeInstanceOf(BookEntity);
      expect(result?.isbn).toBe(mockBookData.isbn);
    });

    it("should return null when book with ISBN not found", async () => {
      queryBuilder.first.mockResolvedValue(null);

      const result = await repository.findByIsbn("non-existent-isbn");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a book successfully", async () => {
      const updateData = { title: "Updated Title", pages: 200 };
      queryBuilder.returning.mockResolvedValue([{ ...mockDbRow, ...updateData }]);

      const result = await repository.update(mockDbRow.book_id, updateData);

      expect(queryBuilder.where).toHaveBeenCalledWith({ book_id: mockDbRow.book_id });
      expect(queryBuilder.update).toHaveBeenCalledWith({
        ...updateData,
        updated_at: expect.any(Date),
      });
      expect(queryBuilder.returning).toHaveBeenCalledWith("*");
      expect(result).toBeInstanceOf(BookEntity);
      expect(result.title).toBe(updateData.title);
    });
  });

  describe("delete", () => {
    it("should delete a book successfully", async () => {
      queryBuilder.delete.mockResolvedValue(1);

      await repository.delete(mockDbRow.book_id);

      expect(queryBuilder.where).toHaveBeenCalledWith({ book_id: mockDbRow.book_id });
      expect(queryBuilder.delete).toHaveBeenCalled();
    });
  });

  describe("search", () => {
    const mockSearchOptions: BookSearchOptions = {
      limit: 10,
      sort_by: "created_at",
      sort_order: "desc",
    };

    beforeEach(() => {
      queryBuilder.limit.mockResolvedValue([mockDbRow]);
    });

    it("should search books with no filters", async () => {
      const result = await repository.search(mockSearchOptions);

      expect(queryBuilder.clone).toHaveBeenCalled();
      expect(queryBuilder.orderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(queryBuilder.orderBy).toHaveBeenCalledWith("id", "desc");
      expect(queryBuilder.limit).toHaveBeenCalledWith(11); // limit + 1
      expect(result.data).toHaveLength(1);
      expect(result.has_next_page).toBe(false);
    });

    it("should apply title filter", async () => {
      const optionsWithFilter: BookSearchOptions = {
        ...mockSearchOptions,
        filters: { title: "gatsby" },
      };

      // Set up a sub-query builder mock for the where clause
      const subQueryBuilder = {
        where: vi.fn().mockReturnThis(),
        orWhereRaw: vi.fn().mockReturnThis(),
      };
      queryBuilder.where.mockImplementation((callback) => {
        callback(subQueryBuilder);
        return queryBuilder;
      });

      await repository.search(optionsWithFilter);

      // Expect the new secure where clause structure
      expect(queryBuilder.where).toHaveBeenCalledWith(expect.any(Function));
      expect(subQueryBuilder.where).toHaveBeenCalledWith('title', 'ilike', '%gatsby%');
      expect(subQueryBuilder.orWhereRaw).toHaveBeenCalledWith("title % ?", ["gatsby"]);
    });

    it("should apply author filter", async () => {
      const optionsWithFilter: BookSearchOptions = {
        ...mockSearchOptions,
        filters: { author: "fitzgerald" },
      };

      // Set up a sub-query builder mock for the where clause
      const subQueryBuilder = {
        where: vi.fn().mockReturnThis(),
        orWhereRaw: vi.fn().mockReturnThis(),
      };
      queryBuilder.where.mockImplementation((callback) => {
        callback(subQueryBuilder);
        return queryBuilder;
      });

      await repository.search(optionsWithFilter);

      // Expect the new secure where clause structure  
      expect(queryBuilder.where).toHaveBeenCalledWith(expect.any(Function));
      expect(subQueryBuilder.where).toHaveBeenCalledWith('author', 'ilike', '%fitzgerald%');
      expect(subQueryBuilder.orWhereRaw).toHaveBeenCalledWith("author % ?", ["fitzgerald"]);
    });

    it("should apply rating filters", async () => {
      const optionsWithFilter: BookSearchOptions = {
        ...mockSearchOptions,
        filters: { min_rating: 3.0, max_rating: 5.0 },
      };

      await repository.search(optionsWithFilter);

      expect(queryBuilder.where).toHaveBeenCalledWith("rating", ">=", 3.0);
      expect(queryBuilder.where).toHaveBeenCalledWith("rating", "<=", 5.0);
    });

    it("should apply full-text search query", async () => {
      const optionsWithFilter: BookSearchOptions = {
        ...mockSearchOptions,
        filters: { search_query: "great gatsby" },
      };

      await repository.search(optionsWithFilter);

      expect(queryBuilder.whereRaw).toHaveBeenCalledWith(
        "search_vector @@ plainto_tsquery('book_search', ?)",
        ["great gatsby"]
      );
    });

    it("should handle cursor pagination for descending order", async () => {
      // Create a valid signed cursor using CursorSecurity
      const cursorSecurity = (repository as any).cursorSecurity;
      const cursor = cursorSecurity.encodeCursor({
        created_at: "2024-01-01T12:00:00Z",
        id: 123,
      });

      const optionsWithCursor: BookSearchOptions = {
        ...mockSearchOptions,
        cursor,
        sort_order: "desc",
      };

      await repository.search(optionsWithCursor);

      expect(queryBuilder.where).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle cursor pagination for ascending order", async () => {
      // Create a valid signed cursor using CursorSecurity  
      const cursorSecurity = (repository as any).cursorSecurity;
      const cursor = cursorSecurity.encodeCursor({
        created_at: "2024-01-01T12:00:00Z",
        id: 123,
      });

      const optionsWithCursor: BookSearchOptions = {
        ...mockSearchOptions,
        cursor,
        sort_order: "asc",
      };

      await repository.search(optionsWithCursor);

      expect(queryBuilder.where).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should sort by different fields", async () => {
      const optionsWithSort: BookSearchOptions = {
        ...mockSearchOptions,
        sort_by: "title",
        sort_order: "asc",
      };

      await repository.search(optionsWithSort);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith("title", "asc");
      expect(queryBuilder.orderBy).toHaveBeenCalledWith("created_at", "asc");
      expect(queryBuilder.orderBy).toHaveBeenCalledWith("id", "asc");
    });

    it("should cap limit at 100", async () => {
      const optionsWithLargeLimit: BookSearchOptions = {
        ...mockSearchOptions,
        limit: 1000,
      };

      await repository.search(optionsWithLargeLimit);

      expect(queryBuilder.limit).toHaveBeenCalledWith(101); // 100 + 1
    });

    it("should detect next page when more results available", async () => {
      const mockRows = Array(11).fill(mockDbRow); // More than limit
      queryBuilder.limit.mockResolvedValue(mockRows);

      const result = await repository.search({ ...mockSearchOptions, limit: 10 });

      expect(result.has_next_page).toBe(true);
      expect(result.data).toHaveLength(10);
      expect(result.next_cursor).toBeDefined();
    });

    it("should throw InvalidCursorError for invalid cursor", async () => {
      const optionsWithInvalidCursor: BookSearchOptions = {
        ...mockSearchOptions,
        cursor: "invalid-cursor",
      };

      await expect(repository.search(optionsWithInvalidCursor)).rejects.toThrow(
        InvalidCursorError
      );
    });

    it("should throw InvalidCursorError for malformed cursor data", async () => {
      const invalidCursor = Buffer.from(
        JSON.stringify({ invalid: "data" })
      ).toString("base64");

      const optionsWithMalformedCursor: BookSearchOptions = {
        ...mockSearchOptions,
        cursor: invalidCursor,
      };

      await expect(repository.search(optionsWithMalformedCursor)).rejects.toThrow(
        InvalidCursorError
      );
    });
  });

  describe("countAll", () => {
    it("should return the total count of books", async () => {
      queryBuilder.count.mockResolvedValue([{ count: "42" }]);

      const result = await repository.countAll();

      expect(queryBuilder.count).toHaveBeenCalledWith("* as count");
      expect(result).toBe(42);
    });
  });

  describe("mapRowToEntity", () => {
    it("should map database row to entity properties", () => {
      const mapRowToEntity = (repository as any).mapRowToEntity.bind(repository);

      const result = mapRowToEntity(mockDbRow);

      expect(result).toEqual({
        id: mockDbRow.id,
        book_id: mockDbRow.book_id,
        title: mockDbRow.title,
        author: mockDbRow.author,
        isbn: mockDbRow.isbn,
        pages: mockDbRow.pages,
        rating: 4.5, // Should be parsed as float
        search_vector: mockDbRow.search_vector,
        created_at: new Date(mockDbRow.created_at),
        updated_at: new Date(mockDbRow.updated_at),
      });
    });

    it("should handle null rating", () => {
      const rowWithNullRating = { ...mockDbRow, rating: null };
      const mapRowToEntity = (repository as any).mapRowToEntity.bind(repository);

      const result = mapRowToEntity(rowWithNullRating);

      expect(result.rating).toBeUndefined();
    });
  });

  describe("cursor security integration", () => {
    it("should use CursorSecurity for encoding and decoding", () => {
      const cursorSecurity = (repository as any).cursorSecurity;
      
      const cursorData = {
        created_at: "2024-01-01T12:00:00Z",
        id: 123,
      };

      const encoded = cursorSecurity.encodeCursor(cursorData);
      const decoded = cursorSecurity.decodeCursor(encoded);

      expect(decoded).toEqual(cursorData);
    });

    it("should throw InvalidCursorError for tampered cursors", async () => {
      const invalidCursor = "tampered-cursor-data";
      
      const optionsWithInvalidCursor: BookSearchOptions = {
        limit: 10,
        cursor: invalidCursor,
      };

      await expect(repository.search(optionsWithInvalidCursor)).rejects.toThrow(InvalidCursorError);
    });

    it("should throw InvalidCursorError for malformed cursor data", async () => {
      const malformedCursor = Buffer.from("invalid json").toString("base64");
      
      const optionsWithMalformedCursor: BookSearchOptions = {
        limit: 10,
        cursor: malformedCursor,
      };

      await expect(repository.search(optionsWithMalformedCursor)).rejects.toThrow(InvalidCursorError);
    });
  });
});
