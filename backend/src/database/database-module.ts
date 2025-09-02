import { Module } from "@nestjs/common";
import { TypedConfigService } from "src/config/typed-config-service";
import { connectionProvider } from "src/database/providers";

@Module({
  providers: [connectionProvider, TypedConfigService],
  exports: [connectionProvider],
})
export class DatabaseModule {}
