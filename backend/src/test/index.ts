import { Inject, Injectable, ModuleMetadata } from "@nestjs/common";
import { Knex } from "knex";
import { Test } from "@nestjs/testing";
import { TypedConfigModule } from "src/config/typed-config-module";
import { DatabaseModule } from "src/database/database-module";
import { LoggerModule } from "src/logger/logger-module";
import { ClsConfigModule } from "src/config/cls-module";
import { DATABASE_CONNECTION } from "src/database/providers";
import { Mock } from "vitest";
import { ClsConfigModuleMock } from "src/test/mock-modules";
import { BookTable, BOOK_SCHEMA } from "src/modules/book/implementation/db-interface";

@Injectable()
export class TestUtils {
  tablesToCleanup = [{ schema: BOOK_SCHEMA, tables: [BookTable.BOOKS] }];

  constructor(@Inject(DATABASE_CONNECTION) private readonly knex: Knex) {}

  async closeDbConnection() {
    await this.knex.destroy();
  }

  async cleanupDb() {
    for (const { tables, schema } of this.tablesToCleanup) {
      await this.truncateTables(tables, schema);
    }
  }

  private async truncateTables(tableNames: string[], schema: string): Promise<void> {
    for (const tableName of tableNames) {
      await this.knex.raw(`TRUNCATE TABLE ${schema}."${tableName}" RESTART IDENTITY CASCADE`);
    }
  }
}

export function createIntegrationTestModule({
  controllers = [],
  exports = [],
  imports = [],
  providers = [],
}: ModuleMetadata = {}) {
  return Test.createTestingModule({
    imports: [TypedConfigModule, DatabaseModule, ClsConfigModule, LoggerModule, ...imports],
    providers: [TestUtils, ...providers],
    exports: [...exports],
    controllers: [...controllers],
  });
}

export function createUnitTestModule({
  controllers = [],
  exports = [],
  imports = [],
  providers = [],
}: ModuleMetadata = {}) {
  return Test.createTestingModule({
    imports: [TypedConfigModule, ClsConfigModuleMock, LoggerModule, ...imports],
    providers: [...providers],
    exports: [...exports],
    controllers: [...controllers],
  });
}

export type MockType<T> = {
  [P in keyof T]: Mock;
};
