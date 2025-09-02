import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Config } from "src/config";

@Injectable()
export class TypedConfigService<ExtendedConfigType = Config> {
  constructor(private configService: ConfigService<ExtendedConfigType>) {}

  get<T extends keyof ExtendedConfigType>(key: T) {
    return this.configService.get(key as any) as ExtendedConfigType[T];
  }
}
