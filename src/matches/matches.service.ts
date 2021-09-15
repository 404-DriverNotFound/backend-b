import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Match } from './match.entity';
import { MatchesRepository } from './matches.repository';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchesRepository)
    private readonly matchesRepository: MatchesRepository,
  ) {}

  async getMatches(user: User): Promise<Match[]> {
    // TODO PAGINATION
    const matches: Match[] = await this.matchesRepository.find({
      where: [{ user1: user }, { user2: user }],
    });
    return matches;
  }
}
