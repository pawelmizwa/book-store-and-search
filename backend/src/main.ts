import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "nestjs-pino";
import { TypedConfigService } from "src/config/typed-config-service";
import fastifyHelmet from "@fastify/helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Config } from "src/config";
import { AllExceptionsFilter } from "src/exceptions/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
    cors: true,
  });

  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        scriptSrc: [`'self'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        fontSrc: [`'self'`]
      }
    }
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Bookstore API")
    .setDescription("The bookstore API for managing books")
    .setVersion("1.0")
    .build();
  const swagger = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, swagger);

  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(TypedConfigService<Config>);
  const port = configService.get("port");
  await app.listen(port, "0.0.0.0", (_, address) => {
    logger.log(`Server listening on address: ${address}`, "NestApplication");
  });
}
bootstrap();
