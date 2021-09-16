import { Column, Entity } from 'typeorm';
import { AchievementName } from '../constants/achievement-name.enum';

@Entity()
export class Achievement {
  @Column({ primary: true })
  name: AchievementName;

  @Column()
  description: string;
}
