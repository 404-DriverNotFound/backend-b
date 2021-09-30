import { User } from 'src/users/entities/user.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { MatchStatus } from './constants/match-status.enum';
import { MatchType } from './constants/match-type.enum';
import { Match } from './match.entity';

@EntityRepository(Match)
export class MatchesRepository extends Repository<Match> {
  async getMatchesByUser(
    type?: MatchType,
    status?: MatchStatus,
    perPage?: number,
    page?: number,
    user?: User,
  ): Promise<Match[]> {
    const qb = this.createQueryBuilder('match')
      .leftJoinAndSelect('match.user1', 'user1')
      .leftJoinAndSelect('match.user2', 'user2')
      .leftJoinAndSelect('match.winner', 'winner')
      .leftJoinAndSelect('match.loser', 'loser');

    if (user) {
      qb.where(
        new Brackets((qb) => {
          qb.where('match.user1Id = :id', { id: user.id });
          qb.orWhere('match.user2Id = :id', { id: user.id });
        }),
      );
    }

    if (status) {
      qb.andWhere('match.status = :status', { status });
    }

    if (type) {
      qb.andWhere('match.type = :type', { type });
    }

    if (perPage) {
      qb.take(perPage);
    }

    if (page) {
      qb.skip(perPage * (page - 1));
    }

    qb.orderBy('match.createdAt', 'DESC');

    return qb.getMany();
  }
}
