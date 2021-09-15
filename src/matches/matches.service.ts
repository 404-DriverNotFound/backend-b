import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { MatchResult } from './match-result.enum';
import { MatchStatus } from './match-status.enum';
import { MatchType } from './match-type.enum';
import { Match } from './match.entity';
import { MatchesRepository } from './matches.repository';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchesRepository)
    private readonly matchesRepository: MatchesRepository,
    private readonly usersService: UsersService,
  ) {}

  getMatches(
    user: User,
    status?: MatchStatus,
    type?: MatchType,
  ): Promise<Match[]> {
    // TODO PAGINATION
    return this.matchesRepository.getMatches(user, status, type);
  }

  getMatchesCount(user: User, result?: MatchResult): Promise<number> {
    return this.matchesRepository.getMatchesCount(user, result);
  }

  async createMatch(
    user1: User,
    name: string,
    type: MatchType,
  ): Promise<Match> {
    const user2: User = await this.usersService.getUserByName(name);
    const match: Match = this.matchesRepository.create({ user1, user2, type });
    await this.matchesRepository.save(match);
    return match;
  }
}
