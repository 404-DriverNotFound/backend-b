import { Column, Entity, ManyToOne } from 'typeorm';
import { AchievementName } from '../constants/achievement-name.enum';
import { User } from './user.entity';

@Entity()
export class Achievement {
  @Column({
    type: 'enum',
    enum: AchievementName,
    default: AchievementName.NEW_COMMER,
    primary: true,
  })
  name: AchievementName;

  @ManyToOne(() => User, { primary: true })
  user: User;
}
