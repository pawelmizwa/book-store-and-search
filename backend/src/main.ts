import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "src/app.module";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "nestjs-pino";
import { TypedConfigService } from "src/config/typed-config-service";
import fastifyHelmet from "@fastify/helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Config } from "src/config";
import { AllExceptionsFilter } from "src/exceptions/all-exceptions.filter";
import { SecurityExceptionFilter } from "src/exceptions/security-exception.filter";
import { InputSanitizationMiddleware } from "src/middleware/input-sanitization.middleware";

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
        fontSrc: [`'self'`],
        connectSrc: [`'self'`],
        frameSrc: [`'none'`],
        objectSrc: [`'none'`],
        baseUri: [`'self'`],
        formAction: [`'self'`]
      }
    },
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapter),
    new SecurityExceptionFilter()
  );
  
  // Add global validation pipe with security settings
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error for unknown properties
    transform: true, // Transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: false, // Prevent implicit type conversion
    },
    disableErrorMessages: process.env.NODE_ENV === 'production', // Hide detailed errors in production
  }));

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
