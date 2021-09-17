import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { MatchResult } from './constants/match-result.enum';
import { MatchStatus } from './constants/match-status.enum';
import { MatchType } from './constants/match-type.enum';
import { Match } from './match.entity';
import { MatchesRepository } from './matches.repository';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchesRepository)
    private readonly matchesRepository: MatchesRepository,
    private readonly usersService: UsersService,
  ) {}

  getMatches(perPage?: number, page?: number): Promise<Match[]> {
    return this.matchesRepository.getMatches(perPage, page);
  }

  getSpectatingMatches(
    type?: MatchType,
    perPage?: number,
    page?: number,
  ): Promise<Match[]> {
    return this.matchesRepository.getSpectatingMatches(type, perPage, page);
  }
  getMyMatches(
    user: User,
    status?: MatchStatus,
    type?: MatchType,
    perPage?: number,
    page?: number,
  ): Promise<Match[]> {
    return this.matchesRepository.getMyMatches(
      user,
      status,
      type,
      perPage,
      page,
    );
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
