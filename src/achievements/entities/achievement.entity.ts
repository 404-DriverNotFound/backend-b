import { Transform } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { AchievementDescription } from '../constants/achievement-description.enum';
import { AchievementName } from '../constants/achievement-name.enum';
import { UserAchievement } from './user-achievement.entity';

@Entity()
export class Achievement {
  @Column({ primary: true })
  name: AchievementName;

  @Column({
    type: 'enum',
    enum: AchievementDescription,
  })
  description: AchievementDescription;

  @OneToMany(
    () => UserAchievement,
    (userAchievement) => userAchievement.achievement,
  )
  @Transform(({ value }) => value[0].createdAt)
  createdAt: UserAchievement[]; // NOTE 원래는 userAchievements 였는데, 응답을 맞춰주기 위해 createdAt으로 변경함.
}
