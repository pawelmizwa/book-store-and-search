"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginatedBooksResponseSchema = exports.bookResponseSchema = exports.bookEntitySchema = exports.searchBooksFormSchema = exports.updateBookFormSchema = exports.createBookFormSchema = exports.bookSearchApiSchema = exports.updateBookApiSchema = exports.createBookApiSchema = exports.isbnSchema = exports.authorSchema = exports.titleSchema = exports.bookIdSchema = void 0;
const zod_1 = require("zod");
// Base validation schemas
exports.bookIdSchema = zod_1.z.string().uuid();
exports.titleSchema = zod_1.z.string().min(1, 'Title is required').max(500, 'Title is too long');
exports.authorSchema = zod_1.z.string().min(1, 'Author is required').max(255, 'Author name is too long');
exports.isbnSchema = zod_1.z
    .string()
    .optional()
    .refine((val) => !val ||
    /^(?:ISBN(?:-13)?:?\s*)?(?:\d{1,5}[\s-]?\d{1,7}[\s-]?\d{1,7}[\s-]?\d{1,7}[\s-]?\d{1})$/.test(val), 'Invalid ISBN format');
// API/Backend schemas - strict typing
exports.createBookApiSchema = zod_1.z.object({
    title: exports.titleSchema,
    author: exports.authorSchema,
    isbn: zod_1.z.string().min(1).max(50).nullable().optional(),
    pages: zod_1.z.number().int().positive().nullable().optional(),
    rating: zod_1.z.number().min(1.0).max(5.0).nullable().optional(),
});
exports.updateBookApiSchema = zod_1.z.object({
    title: exports.titleSchema.optional(),
    author: exports.authorSchema.optional(),
    isbn: zod_1.z.string().min(1).max(50).nullable().optional(),
    pages: zod_1.z.number().int().positive().nullable().optional(),
    rating: zod_1.z.number().min(1.0).max(5.0).nullable().optional(),
});
exports.bookSearchApiSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    min_rating: zod_1.z.coerce.number().min(1.0).max(5.0).optional(),
    max_rating: zod_1.z.coerce.number().min(1.0).max(5.0).optional(),
    search_query: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    cursor: zod_1.z.string().optional(),
    sort_by: zod_1.z.enum(['created_at', 'title', 'author', 'rating']).default('created_at'),
    sort_order: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Frontend/Form schemas - handle string inputs and transformations
exports.createBookFormSchema = zod_1.z.object({
    title: exports.titleSchema,
    author: exports.authorSchema,
    isbn: exports.isbnSchema,
    pages: zod_1.z
        .union([
        zod_1.z.string().transform((val) => (val === '' ? undefined : parseInt(val, 10))),
        zod_1.z.number().int('Pages must be a whole number').positive('Pages must be positive'),
        zod_1.z.undefined(),
    ])
        .optional(),
    rating: zod_1.z
        .union([
        zod_1.z.string().transform((val) => (val === '' ? undefined : parseFloat(val))),
        zod_1.z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
        zod_1.z.undefined(),
    ])
        .optional(),
});
exports.updateBookFormSchema = exports.createBookFormSchema.partial();
exports.searchBooksFormSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    min_rating: zod_1.z
        .union([
        zod_1.z.string().transform((val) => (val === '' ? undefined : parseFloat(val))),
        zod_1.z.number().min(1).max(5),
        zod_1.z.undefined(),
    ])
        .optional(),
    max_rating: zod_1.z
        .union([
        zod_1.z.string().transform((val) => (val === '' ? undefined : parseFloat(val))),
        zod_1.z.number().min(1).max(5),
        zod_1.z.undefined(),
    ])
        .optional(),
    search_query: zod_1.z.string().optional(),
    sort_by: zod_1.z.enum(['created_at', 'title', 'author', 'rating']).default('created_at'),
    sort_order: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Domain entity schema for backend
exports.bookEntitySchema = zod_1.z.object({
    id: zod_1.z.number().int().min(0), // Synthetic sequential primary key (0 = auto-generated)
    book_id: exports.bookIdSchema, // UUID for external references
    title: exports.titleSchema,
    author: exports.authorSchema,
    isbn: zod_1.z.string().min(1).max(50).nullable().optional(),
    pages: zod_1.z.number().int().positive().nullable().optional(),
    rating: zod_1.z.number().min(1.0).max(5.0).nullable().optional(),
    search_vector: zod_1.z.string().nullable().optional(), // Materialized tsvector for FTS
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
});
// Response schema for API
exports.bookResponseSchema = zod_1.z.object({
    book_id: exports.bookIdSchema,
    title: zod_1.z.string(),
    author: zod_1.z.string(),
    isbn: zod_1.z.string().optional(),
    pages: zod_1.z.number().optional(),
    rating: zod_1.z.number().optional(),
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string(),
});
exports.paginatedBooksResponseSchema = zod_1.z.object({
    data: zod_1.z.array(exports.bookResponseSchema),
    has_next_page: zod_1.z.boolean(),
    next_cursor: zod_1.z.string().optional(),
});
