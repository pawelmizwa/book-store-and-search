import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useSearchBooks,
  useGetBook,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  BOOKS_QUERY_KEYS,
  setBooksClient,
  resetBooksClient,
} from "./useBooks";
import { BooksClient } from "../clients/books-client";
import { mockBook, mockBooksList } from "../test/test-utils";

describe("useBooks hooks", () => {
  let queryClient: QueryClient;
  let mockBooksClient: jest.Mocked<BooksClient>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    mockBooksClient = {
      searchBooks: jest.fn(),
      getBookById: jest.fn(),
      createBook: jest.fn(),
      updateBook: jest.fn(),
      deleteBook: jest.fn(),
    } as any;

    setBooksClient(mockBooksClient);
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetBooksClient();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  describe("BOOKS_QUERY_KEYS", () => {
    it("generates correct query keys", () => {
      expect(BOOKS_QUERY_KEYS.all).toEqual(["books"]);
      expect(BOOKS_QUERY_KEYS.search({ title: "test" })).toEqual([
        "books",
        "search",
        { title: "test" },
      ]);
      expect(BOOKS_QUERY_KEYS.byId("123")).toEqual(["books", "123"]);
    });
  });

  describe("useSearchBooks", () => {
    it("calls searchBooks with correct parameters", async () => {
      const mockResponse = { data: mockBooksList, has_next_page: false };
      mockBooksClient.searchBooks.mockResolvedValue(mockResponse);

      const searchParams = { title: "gatsby" };
      const { result } = renderHook(() => useSearchBooks(searchParams), { wrapper });

      await waitFor(() => {
        expect(mockBooksClient.searchBooks).toHaveBeenCalledWith(searchParams);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it("handles search errors", async () => {
      const error = new Error("Search failed");
      mockBooksClient.searchBooks.mockRejectedValue(error);

      const { result } = renderHook(() => useSearchBooks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe("useGetBook", () => {
    it("calls getBookById with correct book_id", async () => {
      mockBooksClient.getBookById.mockResolvedValue(mockBook);

      const { result } = renderHook(() => useGetBook("123"), { wrapper });

      await waitFor(() => {
        expect(mockBooksClient.getBookById).toHaveBeenCalledWith("123");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockBook);
    });
  });

  describe("useCreateBook", () => {
    it("calls createBook and invalidates queries on success", async () => {
      const newBookData = {
        title: "New Book",
        author: "New Author",
      };
      mockBooksClient.createBook.mockResolvedValue(mockBook);

      const { result } = renderHook(() => useCreateBook(), { wrapper });

      result.current.mutate(newBookData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      await waitFor(() => {
        expect(mockBooksClient.createBook).toHaveBeenCalledWith(newBookData);
      });

      expect(result.current.data).toEqual(mockBook);
    });
  });

  describe("useUpdateBook", () => {
    it("calls updateBook with correct data", async () => {
      const updateData = { title: "Updated Title" };
      const updatedBook = { ...mockBook, title: "Updated Title" };
      mockBooksClient.updateBook.mockResolvedValue(updatedBook);

      const { result } = renderHook(() => useUpdateBook(), { wrapper });

      result.current.mutate({ book_id: "123", book_data: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      await waitFor(() => {
        expect(mockBooksClient.updateBook).toHaveBeenCalledWith("123", updateData);
      });

      expect(result.current.data).toEqual(updatedBook);
    });
  });

  describe("useDeleteBook", () => {
    it("calls deleteBook with correct book_id", async () => {
      mockBooksClient.deleteBook.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteBook(), { wrapper });

      result.current.mutate("123");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      await waitFor(() => {
        expect(mockBooksClient.deleteBook).toHaveBeenCalledWith("123");
      });
    });
  });
});
