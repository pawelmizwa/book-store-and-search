import React from 'react';
import { Book } from '../../types/book.types';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onView?: (book: Book) => void;
  className?: string;
}

export function BookCard({ book, onEdit, onDelete, onView, className }: BookCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        <span className="text-yellow-500">★</span>
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200',
      className
    )}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              by {book.author}
            </p>
          </div>
          {book.rating && renderRating(book.rating)}
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          {book.isbn && (
            <p>ISBN: {book.isbn}</p>
          )}
          {book.pages && (
            <p>{book.pages} pages</p>
          )}
          <p>Added: {formatDate(book.created_at)}</p>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(book)}
              >
                View
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(book)}
              >
                Edit
              </Button>
            )}
          </div>
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(book)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}