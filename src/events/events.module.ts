import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsRepository } from 'src/channels/repositories/channels.repository';
import { MatchesRepository } from 'src/matches/matches.repository';
import { AchievementsRepository } from 'src/users/repositories/achievement.repository';
import { UserAchievementsRepository } from 'src/users/repositories/user-achievement.repository';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UsersService } from 'src/users/users.service';
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
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    EventsGateway,
    EventsService,
    LobbyManagerService,
    RoomManagerService,
    GameManagerService,
    UsersService,
  ],
  exports: [EventsGateway],
})
export class EventsModule {}
