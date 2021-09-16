import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { AchievementName } from '../constants/achievement-name.enum';
import { User } from './user.entity';

@Entity()
export class Achievement {
  @Column({
    type: 'enum',
    enum: AchievementName,
    primary: true,
  })
  name: AchievementName;

  @ManyToOne(() => User, { primary: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
