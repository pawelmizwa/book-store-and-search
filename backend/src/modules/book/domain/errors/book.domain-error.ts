import { DomainError } from "src/core/errors/domain-error";
import { BookErrorCodes } from "./book.error-codes";

export class BookDomainError extends DomainError {
  constructor(params: { code: BookErrorCodes; message: string }) {
    super(params.message);
    this.errorCode = params.code;
  }
}

export class BookNotFoundError extends BookDomainError {
  constructor(book_id?: string) {
    super({
      code: BookErrorCodes.BOOK_NOT_FOUND,
      message: book_id ? `Book with ID ${book_id} not found` : "Book not found",
    });
  }
}

export class BookAlreadyExistsError extends BookDomainError {
  constructor(isbn: string) {
    super({
      code: BookErrorCodes.BOOK_ALREADY_EXISTS,
      message: `Book with ISBN ${isbn} already exists`,
    });
  }
}

export class InvalidBookDataError extends BookDomainError {
  constructor(details: string) {
    super({
      code: BookErrorCodes.INVALID_BOOK_DATA,
      message: `Invalid book data: ${details}`,
    });
  }
}

export class DuplicateIsbnError extends BookDomainError {
  constructor(isbn: string) {
    super({
      code: BookErrorCodes.DUPLICATE_ISBN,
      message: `ISBN ${isbn} is already in use`,
    });
  }
}

export class InvalidCursorError extends BookDomainError {
  constructor() {
    super({
      code: BookErrorCodes.INVALID_CURSOR,
      message: "Invalid pagination cursor",
    });
  }
}
