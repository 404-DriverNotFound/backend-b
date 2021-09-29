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
import { AchievementsService } from 'src/achievements/achievements.service';
import { AchievementsRepository } from 'src/achievements/repositories/achievement.repository';
import { UserAchievementsRepository } from 'src/achievements/repositories/user-achievement.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChannelsRepository,
      MembershipsRepository,
      UsersRepository,
      ChatsRepository,
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
    EventsModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, UsersService, AchievementsService],
})
export class ChannelsModule {}
