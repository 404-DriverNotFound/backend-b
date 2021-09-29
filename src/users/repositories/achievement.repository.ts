import { User } from 'src/users/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';

@EntityRepository(Achievement)
export class AchievementsRepository extends Repository<Achievement> {
  async getAchievements(user: User): Promise<Achievement[]> {
    const qb = this.createQueryBuilder('achievement');
    qb.innerJoinAndSelect('achievement.createdAt', 'userAchievements'); // NOTE 원래는 userAchievements 였는데, 응답을 맞춰주기 위해 createdAt으로 변경함.
    qb.innerJoin('userAchievements.user', 'user', 'user.id = :id', {
      id: user.id,
    });
    return await qb.getMany();
  }
}
