import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ACTIVE_PLAYER_TOKENS, PlayerTokenGuard } from './player-token.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly pins = new Map<string, string>();

  @Post('login')
  @ApiOperation({ summary: 'Войти по нику + PIN и получить токен пропуска' })
  @ApiBody({ schema: { example: { player: 'Саша', pin: '1234' } } })
  login(@Body() body: { player?: string; pin?: string }) {
    const player = (body?.player || '').trim().slice(0, 24);
    const pin = (body?.pin || '').trim();
    if (!player || pin.length < 4) {
      throw new BadRequestException('Укажите имя и PIN минимум из 4 символов!');
    }

    const savedPin = this.pins.get(player);
    if (savedPin && savedPin !== pin) {
      throw new BadRequestException('Неверный PIN для этого игрока!');
    }
    this.pins.set(player, pin);

    const token = `tok_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    ACTIVE_PLAYER_TOKENS.set(token, player);
    return { player, token, message: 'Пропуск выдан!' };
  }

  @Post('bonus')
  @UseGuards(PlayerTokenGuard)
  @ApiHeader({ name: 'x-player-token', required: true })
  @ApiOperation({ summary: 'Защищённая ручка: пускает только с валидным токеном' })
  claimProtectedBonus(@Req() req: { authPlayer?: string }) {
    const player = req.authPlayer || 'Игрок';
    return {
      player,
      message: `Добро пожаловать, ${player}! Сейф открыт (+50 бонусных очков).`,
    };
  }
}
