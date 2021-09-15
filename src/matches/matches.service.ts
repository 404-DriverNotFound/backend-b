import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
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

  async getMatches(user: User, status: MatchStatus): Promise<Match[]> {
    // TODO PAGINATION
    const matches: Match[] = await this.matchesRepository.find({
      where: [
        { user1: user, status },
        { user2: user, status },
      ],
    });
    return matches;
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
