import { Module } from "@nestjs/common";
import { BookController } from "./boundary/book.controller";
import { BookService } from "./domain/book.service";
import { BookPgRepository } from "./implementation/book-pg.repository";
import { BOOK_REPOSITORY } from "./constants";

@Module({
  controllers: [BookController],
  providers: [
    BookService,
    {
      provide: BOOK_REPOSITORY,
      useClass: BookPgRepository,
    },
  ],
  exports: [BookService],
})
export class BookModule {}
