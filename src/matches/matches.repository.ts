import { User } from 'src/users/entities/user.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { MatchResult } from './match-result.enum';
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

  async getMatchesCount(user: User, result?: MatchResult): Promise<number> {
    const qb = this.createQueryBuilder('match');

    if (result) {
      result === MatchResult.WIN
        ? qb.where('match.winnerId = :id', { id: user.id })
        : qb.where('match.loserId = :id', { id: user.id });
    } else {
      qb.where(
        new Brackets((qb) => {
          qb.where('match.winnerId = :id', { id: user.id });
          qb.orWhere('match.loserId = :id', { id: user.id });
        }),
      );
    }

    qb.andWhere('match.status = :status', { status: MatchStatus.DONE });

    return qb.getCount();
  }
}
