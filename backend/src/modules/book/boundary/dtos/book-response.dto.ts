import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BookEntity } from "../../domain/book.entity";

export class BookResponseDto {
  @ApiProperty({
    description: "Book unique identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  book_id!: string;

  @ApiProperty({
    description: "Book title",
    example: "The Great Gatsby",
  })
  title!: string;

  @ApiProperty({
    description: "Book author",
    example: "F. Scott Fitzgerald",
  })
  author!: string;

  @ApiPropertyOptional({
    description: "ISBN number",
    example: "978-0-7432-7356-5",
  })
  isbn?: string;

  @ApiPropertyOptional({
    description: "Number of pages",
    example: 180,
  })
  pages?: number;

  @ApiPropertyOptional({
    description: "Book rating from 1 to 5",
    example: 4.5,
  })
  rating?: number;

  @ApiProperty({
    description: "Book creation timestamp",
    example: "2024-01-01T12:00:00Z",
  })
  created_at!: string;

  @ApiProperty({
    description: "Book last update timestamp",
    example: "2024-01-01T12:00:00Z",
  })
  updated_at!: string;

  static fromEntity(entity: BookEntity): BookResponseDto {
    return {
      book_id: entity.book_id,
      title: entity.title,
      author: entity.author,
      isbn: entity.isbn,
      pages: entity.pages,
      rating: entity.rating,
      created_at: entity.created_at.toISOString(),
      updated_at: entity.updated_at.toISOString(),
    };
  }
}

export class PaginatedBooksResponseDto {
  @ApiProperty({
    description: "Array of books",
    type: [BookResponseDto],
  })
  data!: BookResponseDto[];

  @ApiProperty({
    description: "Whether there are more pages available",
    example: true,
  })
  has_next_page!: boolean;

  @ApiPropertyOptional({
    description: "Secure cursor for the next page (base64 encoded with HMAC signature). Use this in subsequent requests for pagination.",
    example: "eyJkYXRhIjp7ImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTAxVDEyOjAwOjAwWiIsImlkIjoxMjN9LCJzaWduYXR1cmUiOiJhYmMxMjMiLCJ0aW1lc3RhbXAiOjE3MDQwNjcyMDB9MDA",
  })
  next_cursor?: string;

  static fromPaginatedResult(result: {
    data: BookEntity[];
    has_next_page: boolean;
    next_cursor?: string;
  }): PaginatedBooksResponseDto {
    return {
      data: result.data.map(BookResponseDto.fromEntity),
      has_next_page: result.has_next_page,
      next_cursor: result.next_cursor,
    };
  }
}
