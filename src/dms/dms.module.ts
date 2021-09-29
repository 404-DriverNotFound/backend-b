import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsService } from 'src/achievements/achievements.service';
import { AchievementsRepository } from 'src/achievements/repositories/achievement.repository';
import { UserAchievementsRepository } from 'src/achievements/repositories/user-achievement.repository';
import { EventsModule } from 'src/events/events.module';
import { FriendshipsRepository } from 'src/friendships/friendships.repository';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UsersService } from 'src/users/users.service';
import { DmsController } from './dms.controller';
import { DmsRepository } from './dms.repository';
import { DmsService } from './dms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DmsRepository,
      UsersRepository,
      FriendshipsRepository,
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
    EventsModule,
  ],
  controllers: [DmsController],
  providers: [
    DmsService,
    UsersService,
    FriendshipsService,
    AchievementsService,
  ],
})
export class DmsModule {}
