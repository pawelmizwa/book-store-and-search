import { Entity } from "src/core/entity";
import { v4 as uuidv4 } from "uuid";
import { PartialBy } from "src/types";
import { 
  bookEntitySchema, 
  BookEntityData, 
  CreateBookProperties,
  BookSearchFilters,
  PaginationOptions,
  BookSearchOptions 
} from "@book-store/shared";

export type BookProperties = BookEntityData;


export class BookEntity extends Entity<BookProperties> {
  constructor(props: BookProperties) {
    super(props, bookEntitySchema);
  }

  static create(props: PartialBy<BookProperties, "id" | "book_id" | "created_at" | "updated_at">) {
    const now = new Date();
    const book_id = uuidv4();
    return new BookEntity({
      id: book_id,
      book_id: book_id,
      created_at: now,
      updated_at: now,
      ...props,
    });
  }

  update(props: Partial<Pick<BookProperties, "title" | "author" | "isbn" | "pages" | "rating">>) {
    const updatedProps = {
      ...this.props,
      ...props,
      updated_at: new Date(),
    };
    return new BookEntity(updatedProps);
  }

  get book_id(): string {
    return this.props.book_id;
  }

  get title(): string {
    return this.props.title;
  }

  get author(): string {
    return this.props.author;
  }

  get isbn(): string | undefined {
    return this.props.isbn ?? undefined;
  }

  get pages(): number | undefined {
    return this.props.pages ?? undefined;
  }

  get rating(): number | undefined {
    return this.props.rating ?? undefined;
  }

  get created_at(): Date {
    return this.props.created_at;
  }

  get updated_at(): Date {
    return this.props.updated_at;
  }
}
