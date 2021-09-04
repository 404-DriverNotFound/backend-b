import { EntityRepository, Repository } from 'typeorm';
import { Dm } from './dm.entity';

@EntityRepository(Dm)
export class DmsRepository extends Repository<Dm> {}
