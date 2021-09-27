import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsRepository } from 'src/channels/repositories/channels.repository';
import { MatchesRepository } from 'src/matches/matches.repository';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { GameManagerService } from './games/game-manager.service';
import { LobbyManagerService } from './games/lobby-manager.service';
import { RoomManagerService } from './games/room-manager.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChannelsRepository,
      UsersRepository,
      MatchesRepository,
    ]),
  ],
  providers: [
    EventsGateway,
    EventsService,
    LobbyManagerService,
    RoomManagerService,
    GameManagerService,
  ],
  exports: [EventsGateway],
})
export class EventsModule {}
