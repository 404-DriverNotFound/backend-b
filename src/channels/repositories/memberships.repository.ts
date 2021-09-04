import { EntityRepository, Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';

@EntityRepository(Membership)
export class MembershipsRepository extends Repository<Membership> {}
