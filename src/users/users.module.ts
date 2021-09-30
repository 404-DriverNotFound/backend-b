import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';
import { AchievementsRepository } from 'src/users/repositories/achievement.repository';
import { UserAchievementsRepository } from './repositories/user-achievement.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersRepository,
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, ConfigService],
})
export class UsersModule {}
