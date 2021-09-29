import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { MatchStatus } from './constants/match-status.enum';
import { MatchType } from './constants/match-type.enum';
import { Match } from './match.entity';
import { MatchesRepository } from './matches.repository';

@Injectable()
export class MatchesService {
  constructor(
      @InjectRepository(MatchesRepository)
      private readonly matchesRepository: MatchesRepository,
  ) {
  }

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
}
