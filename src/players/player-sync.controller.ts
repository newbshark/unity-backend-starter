import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlayerSyncService } from './player-sync.service';

@ApiTags('players')
@Controller('players')
export class PlayerSyncController {
  constructor(private readonly syncService: PlayerSyncService) {}

  @Post('move')
  @ApiOperation({ summary: 'Отправить свои координаты и получить позиции остальных игроков' })
  @ApiBody({
    schema: {
      example: { player: 'Саша', x: 3.5, y: 0.5, z: -2.1, colorHex: '#38BDF8' },
    },
  })
  move(@Body() body: { player?: string; x?: number; y?: number; z?: number; colorHex?: string }) {
    return this.syncService.updatePosition(body || {});
  }

  @Get('positions')
  @ApiOperation({ summary: 'Получить список активных игроков на арене (TTL 10с)' })
  getPositions() {
    return this.syncService.getAll();
  }
}
