import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AchievementName } from './constants/achievement-name.enum';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { AchievementsRepository } from './repositories/achievement.repository';
import { UserAchievementsRepository } from './repositories/user-achievement.repository';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(AchievementsRepository)
    private readonly achievementsRepository: AchievementsRepository,
    @InjectRepository(UserAchievementsRepository)
    private readonly userAchievementsRepository: UserAchievementsRepository,
  ) {}

  getAchievements(user: User): Promise<Achievement[]> {
    return this.achievementsRepository.getAchievements(user);
  }

  async createUserAchievement(
    user: User,
    name: AchievementName,
  ): Promise<UserAchievement> {
    const achievement: Achievement = await this.achievementsRepository.findOne({
      name,
    });

    const userAchievement: UserAchievement =
      this.userAchievementsRepository.create({ user, achievement });

    await this.userAchievementsRepository.save(userAchievement);

    return userAchievement;
  }
}