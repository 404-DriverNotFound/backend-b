import { CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { Achievement } from './achievement.entity';
import { User } from './user.entity';

@Entity()
export class UserAchievement {
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { primary: true })
  user: User;

  @ManyToOne(() => Achievement, { primary: true })
  achievement: Achievement;
}
