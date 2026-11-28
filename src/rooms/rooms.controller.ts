import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Список активных игровых комнат' })
  list() {
    return this.rooms.listRooms();
  }

  @Post('join')
  @ApiOperation({ summary: 'Создать или войти в комнату по коду' })
  @ApiBody({ schema: { example: { roomCode: 'ALPHA', player: 'Саша' } } })
  join(@Body() body: { roomCode?: string; player?: string }) {
    return this.rooms.joinRoom(body?.roomCode, body?.player);
  }

  @Post('hit')
  @ApiOperation({ summary: 'Ударить босса только внутри своей комнаты' })
  @ApiBody({ schema: { example: { roomCode: 'ALPHA', player: 'Саша' } } })
  hit(@Body() body: { roomCode?: string; player?: string }) {
    return this.rooms.hitRoomBoss(body?.roomCode, body?.player);
  }
}
