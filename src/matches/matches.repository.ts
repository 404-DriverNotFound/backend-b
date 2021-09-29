import { User } from 'src/users/entities/user.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';
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

    qb.leftJoinAndSelect('match.user1', 'user1');
    qb.leftJoinAndSelect('match.user2', 'user2');
    qb.where('match.status = :status', { status: MatchStatus.IN_PROGRESS });

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

  async getUserMatches(
    user: User,
    type?: MatchType,
    status?: MatchStatus,
    perPage?: number,
    page?: number,
  ): Promise<Match[]> {
    const qb = this.createQueryBuilder('match');

    qb.leftJoinAndSelect('match.user1', 'user1');
    qb.leftJoinAndSelect('match.user2', 'user2');
    qb.leftJoinAndSelect('match.winner', 'winner');
    qb.leftJoinAndSelect('match.loser', 'loser');

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
}
