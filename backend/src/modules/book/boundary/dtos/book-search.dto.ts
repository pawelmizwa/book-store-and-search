import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsOptional, IsString, IsNumber, IsIn, Min, Max } from "class-validator";
import { BookSearchDto } from "@book-store/shared";

export class BookSearchDtoClass implements BookSearchDto {
  @ApiPropertyOptional({
    description: "Filter by book title (partial match, case insensitive)",
    example: "gatsby",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: "Filter by author name (partial match, case insensitive)",
    example: "fitzgerald",
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: "Minimum rating filter",
    example: 3.0,
    minimum: 1.0,
    maximum: 5.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  @Type(() => Number)
  min_rating?: number;

  @ApiPropertyOptional({
    description: "Maximum rating filter",
    example: 5.0,
    minimum: 1.0,
    maximum: 5.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  @Type(() => Number)
  max_rating?: number;

  @ApiPropertyOptional({
    description: "Full-text search query (searches title and author)",
    example: "great gatsby",
  })
  @IsOptional()
  @IsString()
  search_query?: string;

  @ApiPropertyOptional({
    description: "Number of results to return (max 100)",
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @Transform(({ value }) => value || 10)
  limit: number = 10;

  @ApiPropertyOptional({
    description: "Cursor for pagination (base64 encoded)",
    example: "eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0wMVQxMjowMDowMFoiLCJib29rX2lkIjoiYWJjZGVmIn0=",
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "created_at",
    default: "created_at",
    enum: ["created_at", "title", "author", "rating"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["created_at", "title", "author", "rating"])
  sort_by: "created_at" | "title" | "author" | "rating" = "created_at";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "desc",
    default: "desc",
    enum: ["asc", "desc"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sort_order: "asc" | "desc" = "desc";
}
