import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchStatus } from './constants/match-status.enum';
import { MatchType } from './constants/match-type.enum';
import { Match } from './match.entity';
import { MatchesRepository } from './matches.repository';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchesRepository)
    private readonly matchesRepository: MatchesRepository,
  ) {}

  getMatches(
    type?: MatchType,
    status?: MatchStatus,
    perPage?: number,
    page?: number,
  ): Promise<Match[]> {
    return this.matchesRepository.getMatchesByUser(type, status, perPage, page);
  }
}
