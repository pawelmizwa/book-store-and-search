import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { Button } from '../components/ui/Button';
import { BookList } from '../components/books/BookList';
import { BookSearchForm } from '../components/forms/BookSearchForm';
import { BookForm } from '../components/forms/BookForm';
import { useSearchBooks, useCreateBook, useUpdateBook, useDeleteBook } from '../hooks/useBooks';
import { Book, BookSearchParams, CreateBookFormData, SearchBooksFormData } from '@book-store/shared';

export default function HomePage() {
  const [searchParams, setSearchParams] = useState<BookSearchParams>({
    limit: 12,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Book | null>(null);

  // React Query hooks
  const { data: booksResponse, isLoading, refetch } = useSearchBooks(searchParams);
  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();

  // Pagination state
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>();

  // Update allBooks when data changes
  React.useEffect(() => {
    if (booksResponse) {
      if (searchParams.cursor) {
        // Loading more - append new books
        setAllBooks(prev => [...prev, ...booksResponse.data]);
      } else {
        // New search - replace all books
        setAllBooks(booksResponse.data);
      }
      setCurrentCursor(booksResponse.next_cursor);
    }
  }, [booksResponse, searchParams.cursor]);

  const handleSearch = useCallback((searchData: SearchBooksFormData) => {
    const newParams: BookSearchParams = {
      limit: 12,
      sort_by: searchData.sort_by,
      sort_order: searchData.sort_order,
      cursor: undefined, // Reset cursor for new search
    };

    // Add filters if they exist
    if (searchData.title) newParams.title = searchData.title;
    if (searchData.author) newParams.author = searchData.author;
    if (searchData.min_rating) newParams.min_rating = searchData.min_rating;
    if (searchData.max_rating) newParams.max_rating = searchData.max_rating;
    if (searchData.search_query) newParams.search_query = searchData.search_query;

    setSearchParams(newParams);
    setCurrentCursor(undefined);
    setAllBooks([]);
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchParams({
      limit: 12,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setCurrentCursor(undefined);
    setAllBooks([]);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (currentCursor) {
      const newParams = { ...searchParams, cursor: currentCursor };
      setSearchParams(newParams);
    }
  }, [currentCursor, searchParams]);

  const handleCreateBook = useCallback(async (bookData: CreateBookFormData) => {
    try {
      await createBookMutation.mutateAsync(bookData);
      setShowAddForm(false);
      // Refetch to show the new book
      refetch();
    } catch (error) {
      console.error('Failed to create book:', error);
    }
  }, [createBookMutation, refetch]);

  const handleUpdateBook = useCallback(async (bookData: CreateBookFormData) => {
    if (!editingBook) return;

    try {
      await updateBookMutation.mutateAsync({
        book_id: editingBook.book_id,
        book_data: bookData,
      });
      setEditingBook(null);
      refetch();
    } catch (error) {
      console.error('Failed to update book:', error);
    }
  }, [editingBook, updateBookMutation, refetch]);

  const handleDeleteBook = useCallback(async (book: Book) => {
    try {
      await deleteBookMutation.mutateAsync(book.book_id);
      setShowDeleteConfirm(null);
      // Remove from local state and refetch
      setAllBooks(prev => prev.filter(b => b.book_id !== book.book_id));
      refetch();
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  }, [deleteBookMutation, refetch]);

  const displayBooks = allBooks.length > 0 ? allBooks : booksResponse?.data || [];

  return (
    <>
      <Head>
        <title>Bookstore - Manage Your Book Collection</title>
        <meta name="description" content="A modern bookstore application to manage your book collection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookstore</h1>
            <p className="text-gray-600">Manage your book collection</p>
          </div>

          {/* Add Book Button */}
          <div className="mb-6">
            <Button onClick={() => setShowAddForm(true)}>
              Add New Book
            </Button>
          </div>

          {/* Search Form */}
          <div className="mb-8">
            <BookSearchForm
              onSearch={handleSearch}
              onReset={handleResetSearch}
              isLoading={isLoading}
            />
          </div>

          {/* Book List */}
          <BookList
            books={displayBooks}
            isLoading={isLoading}
            onEdit={setEditingBook}
            onDelete={setShowDeleteConfirm}
            onLoadMore={handleLoadMore}
            hasNextPage={!!currentCursor}
            isLoadingMore={false}
          />

          {/* Add Book Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
                <BookForm
                  onSubmit={handleCreateBook}
                  onCancel={() => setShowAddForm(false)}
                  isLoading={createBookMutation.isPending}
                  submitLabel="Add Book"
                />
              </div>
            </div>
          )}

          {/* Edit Book Modal */}
          {editingBook && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Edit Book</h2>
                <BookForm
                  initialData={editingBook}
                  onSubmit={handleUpdateBook}
                  onCancel={() => setEditingBook(null)}
                  isLoading={updateBookMutation.isPending}
                  submitLabel="Update Book"
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Delete Book</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete &quot;{showDeleteConfirm.title}&quot; by {showDeleteConfirm.author}?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={deleteBookMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteBook(showDeleteConfirm)}
                    disabled={deleteBookMutation.isPending}
                  >
                    {deleteBookMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
