import { EntityRepository, Repository } from 'typeorm';
import { Friendship } from './friendship.entity';

@EntityRepository(Friendship)
export class FriendshipsRepository extends Repository<Friendship> {}
