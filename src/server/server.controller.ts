import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GameConfigState, GameStateService } from '../game-state.service';

@ApiTags('server')
@Controller('server')
export class ServerController {
  constructor(private readonly gameState: GameStateService) {}

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
        serverTime: '2026-11-26T12:00:00.000Z',
        protocolVersion: '1.0.0',
        activePlayers: 1,
      },
    },
  })
  getStatus() {
    this.gameState.recordPing();
    const cfg = this.gameState.getConfig();
    return {
      status: cfg.status,
      uptimeSeconds: this.gameState.getUptimeSeconds(),
      serverTime: new Date().toISOString(),
      protocolVersion: '1.0.0',
      activePlayers: cfg.activePlayers,
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
        title: 'Cyber Arena Server',
        motd: 'Добро пожаловать на сервер! Сегодня двойной опыт (x2 XP)!',
        expMultiplier: 2.0,
      },
    },
  })
  getMotd() {
    this.gameState.recordPing();
    const cfg = this.gameState.getConfig();
    return {
      title: cfg.title,
      motd: cfg.motd,
      expMultiplier: cfg.expMultiplier,
    };
  }

  @Get('config')
  @ApiOperation({
    summary: 'Полный живой конфиг игры (для панели и будущих фич)',
    description: 'Возвращает текущие значения с мобильной панели: множители, цвет, кастомные переменные и статистику.',
  })
  getConfig() {
    this.gameState.recordPing();
    return {
      ...this.gameState.getConfig(),
      stats: this.gameState.getStats(),
    };
  }

  @Post('config')
  @ApiOperation({
    summary: 'Обновить параметры игры на лету',
    description: 'Обновляет значения конфига (используется мобильной панелью управления и Swagger).',
  })
  @ApiBody({
    schema: {
      example: {
        status: 'online',
        title: 'Cyber Arena Server',
        motd: '⚡ Учитель включил режим x5 XP!',
        expMultiplier: 5.0,
        speedMultiplier: 1.5,
        themeColor: '#C6FF00',
        activePlayers: 5,
      },
    },
  })
  updateConfig(@Body() body: Partial<GameConfigState>) {
    const updated = this.gameState.updateConfig(body || {});
    return {
      ok: true,
      config: updated,
      stats: this.gameState.getStats(),
    };
  }
}
