import { User } from 'src/users/entities/user.entity';
import { CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { Achievement } from './achievement.entity';

@Entity()
export class UserAchievement {
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.userAchievements, { primary: true })
  user: User;

  // NOTE 원래는 userAchievements 였는데, 응답을 맞춰주기 위해 createdAt으로 변경함.
  @ManyToOne(() => Achievement, (achievement) => achievement.createdAt, {
    primary: true,
  })
  achievement: Achievement;
}
