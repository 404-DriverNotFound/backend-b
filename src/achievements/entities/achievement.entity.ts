import { Column, Entity } from 'typeorm';
import { AchievementDescription } from '../constants/achievement-description.enum';
import { AchievementName } from '../constants/achievement-name.enum';

@Entity()
export class Achievement {
  @Column({ primary: true })
  name: AchievementName;

  @Column({
    type: 'enum',
    enum: AchievementDescription,
  })
  description: AchievementDescription;
}
