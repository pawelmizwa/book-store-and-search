import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, IsPositive, Min, Max, MaxLength } from "class-validator";
import { UpdateBookDto } from "@book-store/shared";

export class UpdateBookDtoClass implements UpdateBookDto {
  @ApiPropertyOptional({
    description: "Book title",
    example: "The Great Gatsby",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({
    description: "Book author",
    example: "F. Scott Fitzgerald",
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional({
    description: "ISBN number",
    example: "978-0-7432-7356-5",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  isbn?: string;

  @ApiPropertyOptional({
    description: "Number of pages",
    example: 180,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  pages?: number;

  @ApiPropertyOptional({
    description: "Book rating from 1 to 5",
    example: 4.5,
    minimum: 1.0,
    maximum: 5.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  rating?: number;
}
