import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from 'src/events/events.module';
import { FriendshipsRepository } from 'src/friendships/friendships.repository';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { AchievementsRepository } from 'src/users/repositories/achievement.repository';
import { UserAchievementsRepository } from 'src/users/repositories/user-achievement.repository';
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
      AchievementsRepository,
      UserAchievementsRepository,
      FriendshipsRepository,
    ]),
    EventsModule,
  ],
  controllers: [DmsController],
  providers: [DmsService, UsersService, FriendshipsService],
})
export class DmsModule {}
