import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../admin.guard';
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
  @ApiResponse({ status: 200, description: 'Сервер работает штатно' })
  getStatus() {
    this.gameState.recordPing();
    const cfg = this.gameState.getConfig();
    return {
      status: cfg.status,
      uptimeSeconds: this.gameState.getUptimeSeconds(),
      serverTime: new Date().toISOString(),
      protocolVersion: '2.0.0',
      activePlayers: cfg.activePlayers,
    };
  }

  @Get('motd')
  @ApiOperation({
    summary: 'Сообщение дня (Message of the Day)',
    description: 'Возвращает заголовок, текст объявления и множитель опыта (EXP Multiplier) для отображения в игре.',
  })
  @ApiResponse({ status: 200, description: 'MOTD успешно получен' })
  getMotd() {
    this.gameState.recordPing();
    const cfg = this.gameState.getConfig();
    return {
      title: cfg.title,
      motd: cfg.motd,
      expMultiplier: cfg.expMultiplier,
    };
  }

  @Get('world')
  @ApiOperation({
    summary: 'Глобальные законы мира (скорость, масштаб, гравитация, цвет)',
    description: 'Плоский JSON для Unity JsonUtility: позволяет учителю с телефона менять размер кубов и включать лунную гравитацию.',
  })
  @ApiResponse({ status: 200, description: 'Параметры мира получены' })
  getWorld() {
    this.gameState.recordPing();
    return this.gameState.getWorldState();
  }

  @Get('config')
  @ApiOperation({
    summary: 'Полный живой конфиг игры + статистика',
    description: 'Возвращает текущие значения с панели учителя и статистику запросов.',
  })
  getConfig() {
    this.gameState.recordPing();
    return {
      ...this.gameState.getConfig(),
      stats: this.gameState.getStats(),
    };
  }

  @Post('config')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Обновить законы мира на лету',
    description: 'Обновляет множители, масштаб куба, гравитацию и цвет (используется пультом учителя и Swagger).',
  })
  @ApiBody({
    schema: {
      example: {
        status: 'online',
        title: 'Cyber Arena Server',
        motd: 'Учитель включил Лунную гравитацию и размер Титана!',
        expMultiplier: 5.0,
        cubeScale: 2.2,
        lowGravity: true,
        gravityY: -1.8,
        cubeColorHex: '#38BDF8',
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
