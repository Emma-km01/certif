import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ToutesExceptionsFilter } from './common/exceptions.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ToutesExceptionsFilter());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();