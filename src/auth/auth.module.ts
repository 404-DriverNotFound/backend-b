import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './session.serializer';
import { FtStrategy } from './strategies/ft.strategy';
import { AuthService } from './auth.service';
import { AchievementsRepository } from 'src/users/repositories/achievement.repository';
import { UserAchievementsRepository } from 'src/users/repositories/user-achievement.repository';
import { MatchesRepository } from 'src/matches/matches.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersRepository,
      MatchesRepository,
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
  ],
})
export class AuthModule {}
