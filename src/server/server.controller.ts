import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('server')
@Controller('server')
export class ServerController {
  private readonly launchTime = Date.now();

  @Get('status')
  @ApiOperation({
    summary: 'Проверка статуса игрового сервера (Healthcheck)',
    description: 'Возвращает состояние онлайна, аптайм в секундах и версию протокола для клиента Unity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Сервер работает штатно',
    schema: {
      example: {
        status: 'online',
        uptimeSeconds: 42,
        serverTime: '2026-11-25T12:00:00.000Z',
        protocolVersion: '1.0.0',
        activePlayers: 1,
      },
    },
  })
  getStatus() {
    const uptimeSeconds = Math.floor((Date.now() - this.launchTime) / 1000);
    return {
      status: 'online',
      uptimeSeconds,
      serverTime: new Date().toISOString(),
      protocolVersion: '1.0.0',
      activePlayers: 1,
    };
  }

  @Get('motd')
  @ApiOperation({
    summary: 'Сообщение дня (Message of the Day)',
    description: 'Возвращает заголовок, текст объявления и множитель опыта (EXP Multiplier) для отображения в игре.',
  })
  @ApiResponse({
    status: 200,
    description: 'MOTD успешно получен',
    schema: {
      example: {
        title: 'STARTY Battle Arena',
        motd: 'Добро пожаловать на сервер! Сегодня двойной опыт (x2 XP)!',
        expMultiplier: 2.0,
      },
    },
  })
  getMotd() {
    return {
      title: 'STARTY Battle Arena',
      motd: 'Добро пожаловать на сервер! Сегодня двойной опыт (x2 XP)!',
      expMultiplier: 2.0,
    };
  }
}
