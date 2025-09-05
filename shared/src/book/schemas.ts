import { z } from 'zod';

// Base validation schemas
export const bookIdSchema = z.string().uuid();
export const titleSchema = z.string().min(1, 'Title is required').max(500, 'Title is too long');
export const authorSchema = z.string().min(1, 'Author is required').max(255, 'Author name is too long');
export const isbnSchema = z
  .string()
  .optional()
  .refine(
    (val) =>
      !val ||
      /^(?:ISBN(?:-13)?:?\s*)?(?:\d{1,5}[\s-]?\d{1,7}[\s-]?\d{1,7}[\s-]?\d{1,7}[\s-]?\d{1})$/.test(val),
    'Invalid ISBN format'
  );

// API/Backend schemas - strict typing
export const createBookApiSchema = z.object({
  title: titleSchema,
  author: authorSchema,
  isbn: z.string().min(1).max(50).nullable().optional(),
  pages: z.number().int().positive().nullable().optional(),
  rating: z.number().min(1.0).max(5.0).nullable().optional(),
});

export const updateBookApiSchema = z.object({
  title: titleSchema.optional(),
  author: authorSchema.optional(),
  isbn: z.string().min(1).max(50).nullable().optional(),
  pages: z.number().int().positive().nullable().optional(),
  rating: z.number().min(1.0).max(5.0).nullable().optional(),
});

export const bookSearchApiSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  min_rating: z.coerce.number().min(1.0).max(5.0).optional(),
  max_rating: z.coerce.number().min(1.0).max(5.0).optional(),
  search_query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.string().optional(),
  sort_by: z.enum(['created_at', 'title', 'author', 'rating']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Frontend/Form schemas - handle string inputs and transformations
export const createBookFormSchema = z.object({
  title: titleSchema,
  author: authorSchema,
  isbn: isbnSchema,
  pages: z
    .union([
      z.string().transform((val) => (val === '' ? undefined : parseInt(val, 10))),
      z.number().int('Pages must be a whole number').positive('Pages must be positive'),
      z.undefined(),
    ])
    .optional(),
  rating: z
    .union([
      z.string().transform((val) => (val === '' ? undefined : parseFloat(val))),
      z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
      z.undefined(),
    ])
    .optional(),
});

export const updateBookFormSchema = createBookFormSchema.partial();

export const searchBooksFormSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  min_rating: z
    .union([
      z.string().transform((val) => (val === '' ? undefined : parseFloat(val))),
      z.number().min(1).max(5),
      z.undefined(),
    ])
    .optional(),
  max_rating: z
    .union([
      z.string().transform((val) => (val === '' ? undefined : parseFloat(val))),
      z.number().min(1).max(5),
      z.undefined(),
    ])
    .optional(),
  search_query: z.string().optional(),
  sort_by: z.enum(['created_at', 'title', 'author', 'rating']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Domain entity schema for backend
export const bookEntitySchema = z.object({
  id: z.number().int().min(0), // Synthetic sequential primary key (0 = auto-generated)
  book_id: bookIdSchema, // UUID for external references
  title: titleSchema,
  author: authorSchema,
  isbn: z.string().min(1).max(50).nullable().optional(),
  pages: z.number().int().positive().nullable().optional(),
  rating: z.number().min(1.0).max(5.0).nullable().optional(),
  search_vector: z.string().nullable().optional(), // Materialized tsvector for FTS
  created_at: z.date(),
  updated_at: z.date(),
});

// Response schema for API
export const bookResponseSchema = z.object({
  book_id: bookIdSchema,
  title: z.string(),
  author: z.string(),
  isbn: z.string().optional(),
  pages: z.number().optional(),
  rating: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const paginatedBooksResponseSchema = z.object({
  data: z.array(bookResponseSchema),
  has_next_page: z.boolean(),
  next_cursor: z.string().optional(),
});

// Type inference
export type CreateBookApiDto = z.infer<typeof createBookApiSchema>;
export type UpdateBookApiDto = z.infer<typeof updateBookApiSchema>;
export type BookSearchApiDto = z.infer<typeof bookSearchApiSchema>;

export type CreateBookFormData = z.infer<typeof createBookFormSchema>;
export type UpdateBookFormData = z.infer<typeof updateBookFormSchema>;
export type SearchBooksFormData = z.infer<typeof searchBooksFormSchema>;

export type BookEntityData = z.infer<typeof bookEntitySchema>;
export type BookResponseData = z.infer<typeof bookResponseSchema>;
export type PaginatedBooksResponseData = z.infer<typeof paginatedBooksResponseSchema>;

// Export types with clean names
export type CreateBookDto = CreateBookApiDto;
export type UpdateBookDto = UpdateBookApiDto;
export type BookSearchDto = BookSearchApiDto;
