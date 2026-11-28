import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StorageService } from './storage.service';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly storage: StorageService) {}

  @Get()
  @ApiOperation({ summary: 'Загрузить сохранённый профиль игрока с диска' })
  getProfile(@Query('player') player?: string) {
    return this.storage.getProfile(player);
  }

  @Post('xp')
  @ApiOperation({ summary: 'Начислить XP и сохранить профиль в save-data.json' })
  @ApiBody({ schema: { example: { player: 'Саша', amount: 25 } } })
  addXp(@Body() body: { player?: string; amount?: number }) {
    return this.storage.addXp(body?.player, body?.amount);
  }
}
