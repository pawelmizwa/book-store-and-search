import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { searchBooksSchema, SearchBooksFormData } from '../../schemas/book.schemas';

interface BookSearchFormProps {
  onSearch: (data: SearchBooksFormData) => void;
  onReset: () => void;
  initialValues?: Partial<SearchBooksFormData>;
  isLoading?: boolean;
}

export function BookSearchForm({
  onSearch,
  onReset,
  initialValues,
  isLoading = false,
}: BookSearchFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SearchBooksFormData>({
    resolver: zodResolver(searchBooksSchema),
    defaultValues: {
      title: '',
      author: '',
      min_rating: undefined,
      max_rating: undefined,
      search_query: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      ...initialValues,
    },
  });

  const handleReset = () => {
    reset({
      title: '',
      author: '',
      min_rating: undefined,
      max_rating: undefined,
      search_query: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    onReset();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Books</h2>
      
      <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search_query">Search</Label>
          <Input
            id="search_query"
            {...register('search_query')}
            placeholder="Search books by title or author..."
            type="search"
          />
          <p className="text-xs text-gray-500">
            Search across titles and authors using full-text search
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Filter by title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              {...register('author')}
              placeholder="Filter by author"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_rating">Min Rating</Label>
            <Input
              id="min_rating"
              type="number"
              step="0.1"
              min="1"
              max="5"
              {...register('min_rating', { valueAsNumber: true })}
              placeholder="1.0"
            />
            {errors.min_rating && (
              <p className="text-sm text-red-600">{errors.min_rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_rating">Max Rating</Label>
            <Input
              id="max_rating"
              type="number"
              step="0.1"
              min="1"
              max="5"
              {...register('max_rating', { valueAsNumber: true })}
              placeholder="5.0"
            />
            {errors.max_rating && (
              <p className="text-sm text-red-600">{errors.max_rating.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sort_by">Sort By</Label>
            <select
              id="sort_by"
              {...register('sort_by')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="created_at">Date Added</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <select
              id="sort_order"
              {...register('sort_order')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset Filters
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search Books'}
          </Button>
        </div>
      </form>
    </div>
  );
}