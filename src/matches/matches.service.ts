import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  getSpectatingMatches(
    type?: MatchType,
    perPage?: number,
    page?: number,
  ): Promise<Match[]> {
    return this.matchesRepository.getSpectatingMatches(type, perPage, page);
  }
}
