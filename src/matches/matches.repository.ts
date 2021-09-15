import { EntityRepository, Repository } from 'typeorm';
import { Match } from './match.entity';

@EntityRepository(Match)
export class MatchesRepository extends Repository<Match> {}
