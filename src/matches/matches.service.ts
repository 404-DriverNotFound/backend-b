import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { MatchStatus } from './constants/match-status.enum';
import { MatchType } from './constants/match-type.enum';
import { Match } from './match.entity';
import { MatchesRepository } from './matches.repository';
import { UsersService } from '../users/users.service';

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
    return this.matchesRepository.getUserMatches(
      user,
      type,
      status,
      perPage,
      page,
    );
  }

  async getUserMatches(
    name: string,
    type?: MatchType,
    status?: MatchStatus,
    perPage?: number,
    page?: number,
  ): Promise<Match[]> {
    const user = await this.usersService.getUserByName(name);
    return this.matchesRepository.getUserMatches(
      user,
      type,
      status,
      perPage,
      page,
    );
  }
}
