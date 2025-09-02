import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export const createBookDtoSchema = z.object({
  title: z.string().min(1).max(500),
  author: z.string().min(1).max(255),
  isbn: z.string().min(1).max(50).nullable().optional(),
  pages: z.number().int().positive().nullable().optional(),
  rating: z.number().min(1.0).max(5.0).nullable().optional(),
});

export type CreateBookDto = z.infer<typeof createBookDtoSchema>;

export class CreateBookDtoClass implements CreateBookDto {
  @ApiProperty({
    description: "Book title",
    example: "The Great Gatsby",
    maxLength: 500,
  })
  title!: string;

  @ApiProperty({
    description: "Book author",
    example: "F. Scott Fitzgerald",
    maxLength: 255,
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
    minimum: 1,
  })
  pages?: number;

  @ApiPropertyOptional({
    description: "Book rating from 1 to 5",
    example: 4.5,
    minimum: 1.0,
    maximum: 5.0,
  })
  rating?: number;
}
