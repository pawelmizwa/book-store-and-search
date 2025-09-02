import { Module } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";
import { TypedConfigService } from "src/config/typed-config-service";
import { Logger } from "src/logger";

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [TypedConfigService, ClsService],
      providers: [TypedConfigService],
      useFactory: async (config: TypedConfigService, cls: ClsService) =>
        new Logger(config, cls).configureLogger(),
    }),
  ],
})
export class LoggerModule {}
