import { Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private readonly schema: any) {}

  transform(value: any) {
    this.schema.parse(value);
    return value;
  }
}
