import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsController } from './channels.controller';
import { ChannelsRepository } from './repositories/channels.repository';
import { ChannelsService } from './channels.service';
import { MembershipsRepository } from './repositories/memberships.repository';
import { UsersService } from 'src/users/users.service';
import { ChatsRepository } from './repositories/chats.repository';
import { EventsModule } from 'src/events/events.module';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { AchievementsRepository } from 'src/users/repositories/achievement.repository';
import { UserAchievementsRepository } from 'src/users/repositories/user-achievement.repository';
import { MatchesRepository } from 'src/matches/matches.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChannelsRepository,
      MembershipsRepository,
      UsersRepository,
      ChatsRepository,
      MatchesRepository,
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
    EventsModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, UsersService],
})
export class ChannelsModule {}
