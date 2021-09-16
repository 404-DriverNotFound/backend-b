import { User } from 'src/users/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { MembershipRole } from '../membership-role.enum';

@EntityRepository(Channel)
export class ChannelsRepository extends Repository<Channel> {
  async getChannels(
    user: User,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Channel[]> {
    const qb = this.createQueryBuilder('channel');

    qb.leftJoinAndSelect(
      'channel.memberships',
      'memberships',
      'memberships.userId = :myId AND memberships.role != :role',
      { myId: user.id, role: MembershipRole.BANNED },
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
      'memberships.userId = :myId AND memberships.role != :role',
      { myId: user.id, role: MembershipRole.BANNED },
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
