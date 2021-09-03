import { User } from 'src/users/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';

@EntityRepository(Channel)
export class ChannelsRepository extends Repository<Channel> {
  async getChannelsByMe(
    user: User,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Channel[]> {
    const qb = this.createQueryBuilder('channel');

    qb.innerJoinAndSelect(
      'channel.memberships',
      'memberships',
      'memberships.userId = :myId',
      { myId: user.id },
    );

    if (search) {
      qb.andWhere('channel.name LIKE :search', { search: `%${search}%` });
    }

    if (perPage) {
      qb.take(perPage);
    }

    if (page) {
      qb.skip(perPage * (page - 1));
    }

    return await qb.getMany();
  }
}
