import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, IsPositive, Min, Max, MaxLength } from "class-validator";
import { CreateBookDto } from "@book-store/shared";

export class CreateBookDtoClass implements CreateBookDto {
  @ApiProperty({
    description: "Book title",
    example: "The Great Gatsby",
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiProperty({
    description: "Book author",
    example: "F. Scott Fitzgerald",
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  author!: string;

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
