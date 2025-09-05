import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from "@nestjs/swagger";
import { BookService } from "../domain/book.service";
import { createBookApiSchema, updateBookApiSchema, bookSearchApiSchema, bookIdSchema } from "@book-store/shared";
import { CreateBookDtoClass } from "./dtos/create-book.dto";
import { UpdateBookDtoClass } from "./dtos/update-book.dto";
import { BookSearchDtoClass } from "./dtos/book-search.dto";
import { BookResponseDto, PaginatedBooksResponseDto } from "./dtos/book-response.dto";
import { ZodValidationPipe } from "src/validation/zod-validation.pipe";
import { z } from "zod";

@ApiTags("Books")
@Controller("books")
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: "Create a new book" })
  @ApiResponse({
    status: 201,
    description: "Book created successfully",
    type: BookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid book data or duplicate ISBN",
  })
  @UsePipes(new ZodValidationPipe(createBookApiSchema))
  async createBook(@Body() createBookDto: CreateBookDtoClass): Promise<BookResponseDto> {
    const book = await this.bookService.createBook(createBookDto);
    return BookResponseDto.fromEntity(book);
  }

  @Get("search")
  @ApiOperation({ summary: "Search books with filters and pagination" })
  @ApiResponse({
    status: 200,
    description: "Books retrieved successfully",
    type: PaginatedBooksResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid search parameters or cursor",
  })
  @UsePipes(new ZodValidationPipe(bookSearchApiSchema))
  async searchBooks(@Query() searchDto: BookSearchDtoClass): Promise<PaginatedBooksResponseDto> {
    // Input is now validated by ZodValidationPipe
    const validatedDto = searchDto;

    const searchOptions = {
      limit: validatedDto.limit,
      cursor: validatedDto.cursor,
      sort_by: validatedDto.sort_by,
      sort_order: validatedDto.sort_order,
      filters: {
        title: validatedDto.title,
        author: validatedDto.author,
        min_rating: validatedDto.min_rating,
        max_rating: validatedDto.max_rating,
        search_query: validatedDto.search_query,
      },
    };

    // Remove undefined filters
    const cleanedFilters = Object.fromEntries(
      Object.entries(searchOptions.filters).filter(([, value]) => value !== undefined)
    );

    const result = await this.bookService.searchBooks({
      ...searchOptions,
      filters: Object.keys(cleanedFilters).length > 0 ? cleanedFilters : undefined,
    });

    return PaginatedBooksResponseDto.fromPaginatedResult(result);
  }

  @Get(":book_id")
  @ApiOperation({ summary: "Get a book by ID" })
  @ApiParam({
    name: "book_id",
    description: "Book unique identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Book retrieved successfully",
    type: BookResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Book not found",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid book ID format",
  })
  @UsePipes(new ZodValidationPipe(z.object({ book_id: bookIdSchema })))
  async getBookById(@Param("book_id") book_id: string): Promise<BookResponseDto> {
    const book = await this.bookService.getBookById(book_id);
    return BookResponseDto.fromEntity(book);
  }

  @Put(":book_id")
  @ApiOperation({ summary: "Update a book" })
  @ApiParam({
    name: "book_id",
    description: "Book unique identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Book updated successfully",
    type: BookResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Book not found",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid book data, duplicate ISBN, or invalid book ID format",
  })
  @UsePipes(new ZodValidationPipe(z.object({ 
    book_id: bookIdSchema,
    ...updateBookApiSchema.shape 
  })))
  async updateBook(
    @Param("book_id") book_id: string,
    @Body() updateBookDto: UpdateBookDtoClass
  ): Promise<BookResponseDto> {
    const book = await this.bookService.updateBook(book_id, updateBookDto);
    return BookResponseDto.fromEntity(book);
  }

  @Delete(":book_id")
  @ApiOperation({ summary: "Delete a book" })
  @ApiParam({
    name: "book_id",
    description: "Book unique identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 204,
    description: "Book deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Book not found",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid book ID format",
  })
  @UsePipes(new ZodValidationPipe(z.object({ book_id: bookIdSchema })))
  async deleteBook(@Param("book_id") book_id: string): Promise<void> {
    await this.bookService.deleteBook(book_id);
  }

  @Get()
  @ApiOperation({
    summary: "Get all books with basic pagination (deprecated - use /search instead)",
  })
  @ApiResponse({
    status: 200,
    description: "Books retrieved successfully",
    type: PaginatedBooksResponseDto,
  })
  async getAllBooks(@Query() searchDto: BookSearchDtoClass): Promise<PaginatedBooksResponseDto> {
    return this.searchBooks(searchDto);
  }
}
