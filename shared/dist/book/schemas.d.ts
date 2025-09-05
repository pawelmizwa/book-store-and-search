import { z } from 'zod';
export declare const bookIdSchema: z.ZodString;
export declare const titleSchema: z.ZodString;
export declare const authorSchema: z.ZodString;
export declare const isbnSchema: z.ZodOptional<z.ZodString>;
export declare const createBookApiSchema: z.ZodObject<{
    title: z.ZodString;
    author: z.ZodString;
    isbn: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    pages: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rating: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const updateBookApiSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    isbn: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    pages: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rating: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const bookSearchApiSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    min_rating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    max_rating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search_query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    cursor: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodEnum<{
        created_at: "created_at";
        title: "title";
        author: "author";
        rating: "rating";
    }>>;
    sort_order: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const createBookFormSchema: z.ZodObject<{
    title: z.ZodString;
    author: z.ZodString;
    isbn: z.ZodOptional<z.ZodString>;
    pages: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber, z.ZodUndefined]>>;
    rating: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber, z.ZodUndefined]>>;
}, z.core.$strip>;
export declare const updateBookFormSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    isbn: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pages: z.ZodOptional<z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber, z.ZodUndefined]>>>;
    rating: z.ZodOptional<z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber, z.ZodUndefined]>>>;
}, z.core.$strip>;
export declare const searchBooksFormSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    min_rating: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber, z.ZodUndefined]>>;
    max_rating: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber, z.ZodUndefined]>>;
    search_query: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodEnum<{
        created_at: "created_at";
        title: "title";
        author: "author";
        rating: "rating";
    }>>;
    sort_order: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const bookEntitySchema: z.ZodObject<{
    id: z.ZodString;
    book_id: z.ZodString;
    title: z.ZodString;
    author: z.ZodString;
    isbn: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    pages: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rating: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, z.core.$strip>;
export declare const bookResponseSchema: z.ZodObject<{
    book_id: z.ZodString;
    title: z.ZodString;
    author: z.ZodString;
    isbn: z.ZodOptional<z.ZodString>;
    pages: z.ZodOptional<z.ZodNumber>;
    rating: z.ZodOptional<z.ZodNumber>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, z.core.$strip>;
export declare const paginatedBooksResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        book_id: z.ZodString;
        title: z.ZodString;
        author: z.ZodString;
        isbn: z.ZodOptional<z.ZodString>;
        pages: z.ZodOptional<z.ZodNumber>;
        rating: z.ZodOptional<z.ZodNumber>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
    }, z.core.$strip>>;
    has_next_page: z.ZodBoolean;
    next_cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateBookApiDto = z.infer<typeof createBookApiSchema>;
export type UpdateBookApiDto = z.infer<typeof updateBookApiSchema>;
export type BookSearchApiDto = z.infer<typeof bookSearchApiSchema>;
export type CreateBookFormData = z.infer<typeof createBookFormSchema>;
export type UpdateBookFormData = z.infer<typeof updateBookFormSchema>;
export type SearchBooksFormData = z.infer<typeof searchBooksFormSchema>;
export type BookEntityData = z.infer<typeof bookEntitySchema>;
export type BookResponseData = z.infer<typeof bookResponseSchema>;
export type PaginatedBooksResponseData = z.infer<typeof paginatedBooksResponseSchema>;
export type CreateBookDto = CreateBookApiDto;
export type UpdateBookDto = UpdateBookApiDto;
export type BookSearchDto = BookSearchApiDto;
