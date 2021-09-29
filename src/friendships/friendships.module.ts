import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsModule } from 'src/achievements/achievements.module';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UsersService } from 'src/users/users.service';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsRepository } from './friendships.repository';
import { FriendshipsService } from './friendships.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendshipsRepository, UsersRepository]),
    AchievementsModule,
  ],
  controllers: [FriendshipsController],
  providers: [FriendshipsService, UsersService],
})
export class FriendshipsModule {}
