export const BOOK_SCHEMA = "book";

export enum BookTable {
  BOOKS = "books",
}

export interface BookDbModel {
  book_id: string;
  title: string;
  author: string;
  isbn: string | null;
  pages: number | null;
  rating: number | null;
  created_at: Date;
  updated_at: Date;
}
