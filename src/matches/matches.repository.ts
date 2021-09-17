import { User } from 'src/users/entities/user.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { MatchResult } from './constants/match-result.enum';
import { MatchStatus } from './constants/match-status.enum';
import { MatchType } from './constants/match-type.enum';
import { Match } from './match.entity';

@EntityRepository(Match)
export class MatchesRepository extends Repository<Match> {
  async getMatches(perPage?: number, page?: number): Promise<Match[]> {
    return await this.find({
      skip: (page - 1) * perPage,
      take: perPage,
      relations: ['user1', 'user2', 'winner', 'loser'],
    });
  }

  async getSpectatingMatches(
    type?: MatchType,
    perPage?: number,
    page?: number,
  ): Promise<Match[]> {
    const qb = this.createQueryBuilder('match');

    qb.leftJoinAndSelect('match.user1', 'users1');
    qb.leftJoinAndSelect('match.user2', 'users2');
    qb.leftJoinAndSelect('match.winner', 'users3');
    qb.leftJoinAndSelect('match.loser', 'users4');
    qb.where('match.status = :status', { status: MatchStatus.IN_PROGRESS });

    if (type !== undefined) {
      qb.andWhere('match.type = :type', { type });
    }

    if (perPage) {
      qb.take(perPage);
    }

    if (page) {
      qb.skip(perPage * (page - 1));
    }

    return qb.getMany();
  }

  async getMyMatches(
    user: User,
    status?: MatchStatus,
    type?: MatchType,
    perPage?: number,
    page?: number,
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

    if (perPage) {
      qb.take(perPage);
    }

    if (page) {
      qb.skip(perPage * (page - 1));
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
