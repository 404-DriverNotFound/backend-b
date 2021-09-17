import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { AchievementDescription } from 'src/achievements/constants/achievement-description.enum';
import { AchievementName } from 'src/achievements/constants/achievement-name.enum';
import { AchievementsRepository } from 'src/achievements/repositories/achievement.repository';

@Injectable()
export class AchievementsSeeder implements Seeder {
  constructor(
    @InjectRepository(AchievementsRepository)
    private readonly achievementsRepository: AchievementsRepository,
  ) {}

  private readonly achievements = [
    {
      name: AchievementName.FIRST_BLOCK,
      description: AchievementDescription.FIRST_BLOCK,
    },
    {
      name: AchievementName.FIRST_FRIEND,
      description: AchievementDescription.FIRST_FRIEND,
    },
    {
      name: AchievementName.FIRST_GAME,
      description: AchievementDescription.FIRST_GAME,
    },
    {
      name: AchievementName.FIRST_LOSE,
      description: AchievementDescription.FIRST_LOSE,
    },
    {
      name: AchievementName.FIRST_WIN,
      description: AchievementDescription.FIRST_WIN,
    },
  ];

  async seed(): Promise<any> {
    this.achievements.map((element) =>
      this.achievementsRepository.create(element),
    );
    await this.achievementsRepository.save(this.achievements);
    return this.achievements;
  }

  async drop(): Promise<any> {
    const achievementKeys: AchievementName[] = this.achievements.reduce(
      (acc, cur) => [...acc, cur.name],
      [],
    );
    return await this.achievementsRepository.delete(achievementKeys);
  }
}
