import { Module } from '@nestjs/common';
import { ServerController } from './server/server.controller';

@Module({
  imports: [],
  controllers: [ServerController],
  providers: [],
})
export class AppModule {}
