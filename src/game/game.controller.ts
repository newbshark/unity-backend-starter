import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameStateService } from '../game-state.service';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameState: GameStateService) {}

  @Get('boss')
  @ApiOperation({
    summary: 'Текущее состояние общего Мирового Босса класса',
    description: 'Показывает имя босса, текущее HP из 100 и последнего атаковавшего ученика.',
  })
  getBoss() {
    return this.gameState.getBoss();
  }

  @Post('boss/hit')
  @ApiOperation({
    summary: 'Ударить общего Мирового Босса из Unity (Space)',
    description: 'Урон ограничивается сервером (от 1 до 25 за удар). При HP = 0 босс засчитывает победу и награду +50 монет.',
  })
  @ApiBody({
    schema: {
      example: { player: 'Саша', damage: 15 },
    },
  })
  hitBoss(@Body() body: { player?: string; damage?: number }) {
    return this.gameState.hitBoss(body?.player, body?.damage);
  }

  @Post('boss/reset')
  @ApiOperation({
    summary: 'Возродить Мирового Босса до 100 HP',
  })
  resetBoss() {
    return this.gameState.resetBoss();
  }

  @Post('loot')
  @ApiOperation({
    summary: 'Открыть серверный сундук с лутом (RNG на стороне NestJS)',
    description: 'Исключает подкрутку дропа клиентом: редкость и награду выбирает сервер.',
  })
  @ApiBody({
    schema: {
      example: { player: 'Саша' },
    },
  })
  openLoot(@Body() body: { player?: string }) {
    return this.gameState.openLootChest(body?.player);
  }

  @Post('coin')
  @ApiOperation({
    summary: 'Собрать монеты с серверной проверкой Античита',
    description: 'Разрешает запрос от 1 до 20 за раз (с учётом множителя сервера). Попытка прислать 999999 блокируется античитом.',
  })
  @ApiBody({
    schema: {
      example: { player: 'Саша', amount: 10 },
    },
  })
  collectCoin(@Body() body: { player?: string; amount?: number }) {
    return this.gameState.collectCoin(body?.player, body?.amount);
  }

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Таблица лидеров класса (монеты и попытки взлома)',
  })
  getLeaderboard() {
    return this.gameState.getLeaderboard();
  }

  @Post('players/reset')
  @ApiOperation({
    summary: 'Сбросить таблицу игроков и счётчики античита',
  })
  resetPlayers() {
    return this.gameState.resetPlayers();
  }
}
