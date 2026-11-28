import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();

  @Get()
  @ApiOperation({ summary: 'Проверка готовности продакшен-сервера для облака и Unity' })
  check() {
    return {
      ok: 'true',
      env: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }
}
