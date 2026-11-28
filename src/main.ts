import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Включаем нативный WebSocket-адаптер (Урок 07: ws:// вместо polling)
  app.useWebSocketAdapter(new WsAdapter(app));

  // КРИТИЧЕСКИ ВАЖНО ДЛЯ UNITY: Разрешаем CORS и заголовки авторизации
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, x-admin-key, x-player-token',
    credentials: true,
  });

  // Swagger включаем локально или при явном ENABLE_SWAGGER=true (в облаке по умолчанию выключен)
  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' ||
    (!process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV !== 'production');

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Unity Game Backend API')
      .setDescription('Игровой сервер на NestJS для подключения клиентов Unity (Уроки 01–09)')
      .setVersion('3.0')
      .addTag('server', 'Статус сервера, конфиг мира и физика')
      .addTag('game', 'Мировой босс, серверные сундуки, монеты и античит')
      .addTag('players', 'Урок 02: Живые призраки и координаты онлайн')
      .addTag('beacon', 'Урок 03: Командный маяк')
      .addTag('auth', 'Урок 04: Авторизация игроков и Guard')
      .addTag('profile', 'Урок 05: Профиль и сохранение прогресса')
      .addTag('shop', 'Урок 06: Серверный магазин и инвентарь')
      .addTag('rooms', 'Урок 08: Игровые комнаты и лобби')
      .addTag('health', 'Урок 09: Healthcheck продакшена')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log('====================================================');
  logger.log(`🚀 Игровой бэкенд запущен: http://localhost:${port}`);
  logger.log(`📖 Swagger документация: http://localhost:${port}/api`);
  logger.log('🎮 Unity ServerBridge готов принимать подключения!');
  logger.log('====================================================');
}
bootstrap();
