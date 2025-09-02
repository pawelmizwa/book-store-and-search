import { ClsPluginTransactional, TransactionalAdapter } from "@nestjs-cls/transactional";
import { Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";

export class TransactionAdapterMock implements TransactionalAdapter<any, any, any> {
  connectionToken: any;
  constructor(options: { connectionToken: any }) {
    this.connectionToken = options.connectionToken;
  }
  optionsFactory = () => ({
    wrapWithTransaction: async (
      _options: any,
      fn: (...args: any[]) => Promise<any>,
      setTxInstance: (_client?: any) => void
    ) => {
      setTxInstance();
      try {
        return await fn();
      } catch (e) {
        throw e;
      }
    },
    getFallbackInstance: () => {
      return {};
    },
  });
}

export class MockDbConnection {}

@Module({
  providers: [MockDbConnection],
  exports: [MockDbConnection],
})
class DbConnectionModule {}

export const ClsConfigModuleMock = ClsModule.forRoot({
  global: true,
  plugins: [
    new ClsPluginTransactional({
      imports: [DbConnectionModule],
      adapter: new TransactionAdapterMock({
        connectionToken: MockDbConnection,
      }),
    }),
  ],
});
