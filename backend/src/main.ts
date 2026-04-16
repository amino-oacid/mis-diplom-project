import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { httpCorsMethods, httpLocalhost } from './constants';

const { PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); // Глобальный префикс для всех маршрутов
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  ); // Глобальная валидация DTO
  app.enableCors({
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
    methods: httpCorsMethods,
    origin: `${httpLocalhost}:${PORT}`,
  }); // CORS настройки

  await app.listen(PORT || 3001);
  
  console.log(`Сервер запущен на порту ${PORT || 3001}`);
  console.log(`Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Хост бд: ${process.env.POSTGRES_HOST}`);
}
bootstrap();
