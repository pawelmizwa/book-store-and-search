import { Injectable, PipeTransform, BadRequestException } from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema<any>) {}

  transform(value: any) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((err: any) => `${err.path.join(".")}: ${err.message}`);
        throw new BadRequestException(`Validation failed: ${messages.join(", ")}`);
      }
      throw new BadRequestException("Validation failed");
    }
  }
}
