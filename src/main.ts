import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // КРИТИЧЕСКИ ВАЖНО ДЛЯ UNITY: Разрешаем CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Настройка интерактивной документации Swagger
  const config = new DocumentBuilder()
    .setTitle('Unity Game Backend API')
    .setDescription('Игровой сервер на NestJS для подключения клиентов Unity')
    .setVersion('2.0')
    .addTag('server', 'Статус сервера, конфиг мира и физика')
    .addTag('game', 'Мировой босс, серверные сундуки, монеты и античит')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log('====================================================');
  logger.log(`🚀 Игровой бэкенд запущен: http://localhost:${port}`);
  logger.log(`📖 Swagger документация: http://localhost:${port}/api`);
  logger.log('🎮 Unity ServerBridge готов принимать подключения!');
  logger.log('====================================================');
}
bootstrap();
