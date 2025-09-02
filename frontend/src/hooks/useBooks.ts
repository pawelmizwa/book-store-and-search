import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BooksClient } from '../clients/books-client';
import { CreateBookRequest, UpdateBookRequest, BookSearchParams } from '../types/book.types';

const booksClient = new BooksClient();

export const BOOKS_QUERY_KEYS = {
  all: ['books'] as const,
  search: (params: BookSearchParams) => ['books', 'search', params] as const,
  byId: (id: string) => ['books', id] as const,
};

export function useSearchBooks(params: BookSearchParams = {}) {
  return useQuery({
    queryKey: BOOKS_QUERY_KEYS.search(params),
    queryFn: () => booksClient.searchBooks(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGetBook(book_id: string) {
  return useQuery({
    queryKey: BOOKS_QUERY_KEYS.byId(book_id),
    queryFn: () => booksClient.getBookById(book_id),
    enabled: !!book_id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (book_data: CreateBookRequest) => booksClient.createBook(book_data),
    onSuccess: () => {
      // Invalidate all book queries
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEYS.all });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ book_id, book_data }: { book_id: string; book_data: UpdateBookRequest }) =>
      booksClient.updateBook(book_id, book_data),
    onSuccess: (updatedBook) => {
      // Update the specific book in cache
      queryClient.setQueryData(BOOKS_QUERY_KEYS.byId(updatedBook.book_id), updatedBook);
      // Invalidate search queries
      queryClient.invalidateQueries({ queryKey: ['books', 'search'] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (book_id: string) => booksClient.deleteBook(book_id),
    onSuccess: (_, book_id) => {
      // Remove the book from cache
      queryClient.removeQueries({ queryKey: BOOKS_QUERY_KEYS.byId(book_id) });
      // Invalidate search queries
      queryClient.invalidateQueries({ queryKey: ['books', 'search'] });
    },
  });
}