import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { AchievementsRepository } from './repositories/achievement.repository';
import { UserAchievementsRepository } from './repositories/user-achievement.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
