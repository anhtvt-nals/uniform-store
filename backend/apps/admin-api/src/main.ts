import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require('compression');
import { HttpExceptionFilter, TransformInterceptor } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.use(helmet());
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const globalPrefix = process.env.ADMIN_API_PREFIX || 'api/v1/admin';
  app.setGlobalPrefix(globalPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Admin API')
    .setDescription('Uniform Store admin API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .setExternalDoc('OpenAPI JSON', `/${globalPrefix}/api/docs-json`)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/api/docs`, app, document);

  const port = process.env.ADMIN_PORT || 3002;
  await app.listen(port);
  logger.log(`Admin API running on port ${port}`);
}
bootstrap();
