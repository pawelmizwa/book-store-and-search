import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { createBookFormSchema, CreateBookFormData, Book } from '@book-store/shared';

interface BookFormProps {
  initialData?: Book;
  onSubmit: (data: CreateBookFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BookForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Book',
}: BookFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createBookFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          author: initialData.author,
          isbn: initialData.isbn || '',
          pages: initialData.pages || undefined,
          rating: initialData.rating || undefined,
        }
      : {
          title: '',
          author: '',
          isbn: '',
          pages: undefined,
          rating: undefined,
        },
  });

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter book title"
          aria-invalid={errors.title ? 'true' : 'false'}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author *</Label>
        <Input
          id="author"
          {...register('author')}
          placeholder="Enter author name"
          aria-invalid={errors.author ? 'true' : 'false'}
        />
        {errors.author && (
          <p className="text-sm text-red-600">{errors.author.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="isbn">ISBN</Label>
        <Input
          id="isbn"
          {...register('isbn')}
          placeholder="Enter ISBN (optional)"
          aria-invalid={errors.isbn ? 'true' : 'false'}
        />
        {errors.isbn && (
          <p className="text-sm text-red-600">{errors.isbn.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pages">Pages</Label>
          <Input
            id="pages"
            type="number"
            {...register('pages')}
            placeholder="Number of pages"
            aria-invalid={errors.pages ? 'true' : 'false'}
          />
          {errors.pages && (
            <p className="text-sm text-red-600">{errors.pages.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="1"
            max="5"
            {...register('rating')}
            placeholder="Book rating"
            aria-invalid={errors.rating ? 'true' : 'false'}
          />
          {errors.rating && (
            <p className="text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}