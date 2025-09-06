import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterKnex } from "@nestjs-cls/transactional-adapter-knex";
import { Logger } from "@nestjs/common";

export abstract class PgRepository {
  protected abstract schema: string;
  protected abstract tableName: string;
  protected readonly logger = new Logger(PgRepository.name);

  constructor(protected readonly knex: TransactionHost<TransactionalAdapterKnex>) {
    this.logger.debug(`Repository initialized for ${this.constructor.name}`);
  }

  private prepareBaseQuery() {
    try {
      const query = this.knex.tx.withSchema(this.schema).table(this.tableName);
      this.logger.debug(`Query prepared for table: ${this.schema}.${this.tableName}`);
      return query;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to prepare query for ${this.schema}.${this.tableName}: ${errorMessage}`, {
        error: error instanceof Error ? error.stack : String(error),
        schema: this.schema,
        tableName: this.tableName
      });
      throw error;
    }
  }

  protected get query() {
    return this.prepareBaseQuery();
  }
}
