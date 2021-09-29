import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';
import { AchievementsService } from 'src/achievements/achievements.service';
import { AchievementsRepository } from 'src/achievements/repositories/achievement.repository';
import { UserAchievementsRepository } from 'src/achievements/repositories/user-achievement.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersRepository,
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, ConfigService, AchievementsService],
})
export class UsersModule {}
