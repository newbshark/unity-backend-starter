import { Module } from '@nestjs/common';
import { ServerController } from './server/server.controller';
import { DashboardController } from './dashboard.controller';
import { GameStateService } from './game-state.service';

@Module({
  imports: [],
  controllers: [DashboardController, ServerController],
  providers: [GameStateService],
})
export class AppModule {}
