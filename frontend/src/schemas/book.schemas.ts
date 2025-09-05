import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title is too long"),
  author: z.string().min(1, "Author is required").max(255, "Author name is too long"),
  isbn: z
    .string()
    .optional()
    .refine(
      val =>
        !val ||
        /^(?:ISBN(?:-13)?:?\s*)?(?:\d{1,5}[\s-]?\d{1,7}[\s-]?\d{1,7}[\s-]?\d{1,7}[\s-]?\d{1})$/.test(
          val
        ),
      "Invalid ISBN format"
    ),
  pages: z
    .union([
      z.string().transform(val => (val === "" ? undefined : parseInt(val, 10))),
      z.number().int("Pages must be a whole number").positive("Pages must be positive"),
      z.undefined(),
    ])
    .optional(),
  rating: z
    .union([
      z.string().transform(val => (val === "" ? undefined : parseFloat(val))),
      z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
      z.undefined(),
    ])
    .optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const searchBooksSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  min_rating: z
    .union([
      z.string().transform(val => (val === "" ? undefined : parseFloat(val))),
      z.number().min(1).max(5),
      z.undefined(),
    ])
    .optional(),
  max_rating: z
    .union([
      z.string().transform(val => (val === "" ? undefined : parseFloat(val))),
      z.number().min(1).max(5),
      z.undefined(),
    ])
    .optional(),
  search_query: z.string().optional(),
  sort_by: z.enum(["created_at", "title", "author", "rating"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateBookFormData = z.infer<typeof createBookSchema>;
export type UpdateBookFormData = z.infer<typeof updateBookSchema>;
export type SearchBooksFormData = z.infer<typeof searchBooksSchema>;
