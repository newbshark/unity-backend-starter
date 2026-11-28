import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BeaconService } from './beacon.service';

@ApiTags('beacon')
@Controller('beacon')
export class BeaconController {
  constructor(private readonly beaconService: BeaconService) {}

  @Get()
  @ApiOperation({ summary: 'Узнать текущий счётчик комбо маяка' })
  getBeacon() {
    return this.beaconService.getStatus();
  }

  @Post('pulse')
  @ApiOperation({ summary: 'Отправить импульс маяка из Unity (клавиша G)' })
  @ApiBody({ schema: { example: { player: 'Саша' } } })
  sendPulse(@Body() body: { player?: string }) {
    return this.beaconService.pulse(body?.player);
  }
}
