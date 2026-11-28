import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ShopService } from './shop.service';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Получить баланс и инвентарь игрока' })
  getWallet(@Query('player') player?: string) {
    return this.shop.getWallet(player);
  }

  @Post('buy')
  @ApiOperation({ summary: 'Купить предмет по ID (цена берётся только на сервере!)' })
  @ApiBody({ schema: { example: { player: 'Саша', itemId: 'hammer' } } })
  buy(@Body() body: { player?: string; itemId?: string }) {
    return this.shop.buyItem(body?.player, body?.itemId);
  }
}
