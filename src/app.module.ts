import { Module } from '@nestjs/common';
import { ServerController } from './server/server.controller';
import { GameController } from './game/game.controller';
import { DashboardController } from './dashboard.controller';
import { GameStateService } from './game-state.service';
import { PlayerSyncController } from './players/player-sync.controller';
import { PlayerSyncService } from './players/player-sync.service';
import { BeaconModule } from './beacon/beacon.module';
import { AuthController } from './auth/auth.controller';
import { ProfileController } from './profile/profile.controller';
import { StorageService } from './profile/storage.service';
import { ShopController } from './shop/shop.controller';
import { ShopService } from './shop/shop.service';
import { EventsGateway } from './events/events.gateway';
import { RoomsController } from './rooms/rooms.controller';
import { RoomsService } from './rooms/rooms.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [BeaconModule],
  controllers: [
    DashboardController,
    ServerController,
    GameController,
    PlayerSyncController,
    AuthController,
    ProfileController,
    ShopController,
    RoomsController,
    HealthController,
  ],
  providers: [
    GameStateService,
    PlayerSyncService,
    StorageService,
    ShopService,
    EventsGateway,
    RoomsService,
  ],
})
export class AppModule {}
