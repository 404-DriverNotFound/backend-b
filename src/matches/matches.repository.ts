import { User } from 'src/users/user.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { MatchStatus } from './match-status.enum';
import { MatchType } from './match-type.enum';
import { Match } from './match.entity';

@EntityRepository(Match)
export class MatchesRepository extends Repository<Match> {
  async getMatches(
    user: User,
    status?: MatchStatus,
    type?: MatchType,
  ): Promise<Match[]> {
    const qb = this.createQueryBuilder('match');

    qb.where(
      new Brackets((qb) => {
        qb.where('match.user1Id = :id', { id: user.id });
        qb.orWhere('match.user2Id = :id', { id: user.id });
      }),
    );

    if (status) {
      qb.andWhere('match.status = :status', { status });
    }

    if (type) {
      qb.andWhere('match.type = :type', { type });
    }

    return qb.getMany();
  }
}
