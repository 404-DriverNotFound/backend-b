import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './session.serializer';
import { FtStrategy } from './strategies/ft.strategy';
import { AuthService } from './auth.service';
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
  controllers: [AuthController],
  providers: [
    ConfigService,
    FtStrategy,
    SessionSerializer,
    UsersService,
    AuthService,
    AchievementsService,
  ],
})
export class AuthModule {}
