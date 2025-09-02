import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import config from "src/config";
import { TypedConfigService } from "src/config/typed-config-service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
  ],
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class TypedConfigModule {}
