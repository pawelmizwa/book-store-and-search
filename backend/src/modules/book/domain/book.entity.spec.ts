import { describe, it, expect } from "vitest";
import { BookEntity } from "./book.entity";
import { CreateBookProperties } from "@book-store/shared";

describe("BookEntity", () => {
  const validBookData: CreateBookProperties = {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    pages: 180,
    rating: 4.5,
  };

  describe("create", () => {
    it("should create a book entity with generated id and timestamps", () => {
      const book = BookEntity.create(validBookData);

      expect(book.book_id).toEqual(expect.any(String));
      expect(book.title).toBe(validBookData.title);
      expect(book.author).toBe(validBookData.author);
      expect(book.isbn).toBe(validBookData.isbn);
      expect(book.pages).toBe(validBookData.pages);
      expect(book.rating).toBe(validBookData.rating);
      expect(book.created_at).toEqual(expect.any(Date));
      expect(book.updated_at).toEqual(expect.any(Date));
    });

    it("should create a book entity without optional fields", () => {
      const minimalBookData = {
        title: "Test Book",
        author: "Test Author",
      };

      const book = BookEntity.create(minimalBookData);

      expect(book.book_id).toEqual(expect.any(String));
      expect(book.title).toBe(minimalBookData.title);
      expect(book.author).toBe(minimalBookData.author);
      expect(book.isbn).toBeUndefined();
      expect(book.pages).toBeUndefined();
      expect(book.rating).toBeUndefined();
      expect(book.created_at).toEqual(expect.any(Date));
      expect(book.updated_at).toEqual(expect.any(Date));
    });

    it("should validate title length", () => {
      const invalidData = {
        ...validBookData,
        title: "",
      };

      expect(() => BookEntity.create(invalidData)).toThrow();
    });

    it("should validate rating range", () => {
      const invalidData = {
        ...validBookData,
        rating: 6.0,
      };

      expect(() => BookEntity.create(invalidData)).toThrow();
    });

    it("should validate pages as positive integer", () => {
      const invalidData = {
        ...validBookData,
        pages: -5,
      };

      expect(() => BookEntity.create(invalidData)).toThrow();
    });
  });

  describe("update", () => {
    it("should update book properties and timestamp", async () => {
      const originalBook = BookEntity.create(validBookData);
      const updateData = {
        title: "Updated Title",
        rating: 3.5,
      };

      // Add a small delay to ensure timestamps are different
      await new Promise(resolve => setTimeout(resolve, 1));
      const updatedBook = originalBook.update(updateData);

      expect(updatedBook.book_id).toBe(originalBook.book_id);
      expect(updatedBook.title).toBe(updateData.title);
      expect(updatedBook.author).toBe(originalBook.author); // unchanged
      expect(updatedBook.rating).toBe(updateData.rating);
      expect(updatedBook.updated_at.getTime()).toBeGreaterThanOrEqual(
        originalBook.updated_at.getTime()
      );
    });
  });

  describe("getters", () => {
    it("should provide access to all properties", () => {
      const book = BookEntity.create(validBookData);

      expect(book.book_id).toEqual(expect.any(String));
      expect(book.title).toBe(validBookData.title);
      expect(book.author).toBe(validBookData.author);
      expect(book.isbn).toBe(validBookData.isbn);
      expect(book.pages).toBe(validBookData.pages);
      expect(book.rating).toBe(validBookData.rating);
      expect(book.created_at).toEqual(expect.any(Date));
      expect(book.updated_at).toEqual(expect.any(Date));
    });
  });
});
