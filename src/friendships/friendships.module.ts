import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsService } from 'src/achievements/achievements.service';
import { AchievementsRepository } from 'src/achievements/repositories/achievement.repository';
import { UserAchievementsRepository } from 'src/achievements/repositories/user-achievement.repository';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UsersService } from 'src/users/users.service';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsRepository } from './friendships.repository';
import { FriendshipsService } from './friendships.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FriendshipsRepository,
      UsersRepository,
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
  ],
  controllers: [FriendshipsController],
  providers: [FriendshipsService, UsersService, AchievementsService],
})
export class FriendshipsModule {}
