import { z } from "zod";

export abstract class Entity<T extends { id: string }> {
  protected _: T;
  protected readonly schema: z.ZodSchema<T>;

  constructor(props: T, schema: z.ZodSchema<T>) {
    this.schema = schema;
    this._ = this.validateInvariants(props);
  }

  get id() {
    return this._.id;
  }

  get props() {
    return this._;
  }

  private validateInvariants(props: T): T {
    return this.schema.parse(props);
  }
}
