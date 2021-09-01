import { EntityRepository, Repository } from 'typeorm';
import { Channel } from './channel.entity';

@EntityRepository(Channel)
export class ChannelsRepository extends Repository<Channel> {}
