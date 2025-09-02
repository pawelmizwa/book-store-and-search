import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterKnex } from "@nestjs-cls/transactional-adapter-knex";

export abstract class PgRepository {
  protected abstract schema: string;
  protected abstract tableName: string;

  constructor(protected readonly knex: TransactionHost<TransactionalAdapterKnex>) {}

  private prepareBaseQuery() {
    return this.knex.tx.withSchema(this.schema).table(this.tableName);
  }

  protected get query() {
    return this.prepareBaseQuery();
  }
}
