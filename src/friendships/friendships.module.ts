import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsRepository } from 'src/users/repositories/achievement.repository';
import { UserAchievementsRepository } from 'src/users/repositories/user-achievement.repository';
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
  providers: [FriendshipsService, UsersService],
})
export class FriendshipsModule {}
