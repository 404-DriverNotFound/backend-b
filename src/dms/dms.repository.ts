import { User } from 'src/users/user.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { Dm } from './dm.entity';

@EntityRepository(Dm)
export class DmsRepository extends Repository<Dm> {
  async getDMsByOpposite(
    user: User,
    opposite: User,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Dm[]> {
    const qb = this.createQueryBuilder('dm')
      .leftJoinAndSelect('dm.sender', 'sender')
      .leftJoinAndSelect('dm.receiver', 'receiver')
      .where(
        new Brackets((qb) => {
          const parameters = { userId: user.id, oppositeId: opposite.id };
          qb.where(
            'sender.id = :userId AND receiver.id = :oppositeId',
            parameters,
          ).orWhere(
            'sender.id = :oppositeId AND receiver.id = :userId',
            parameters,
          );
        }),
      )
      .orderBy('dm.createdAt', 'DESC');

    if (search) {
      qb.andWhere('dm.content LIKE :search', { search: `%${search}%` });
    }

    if (perPage) {
      qb.take(perPage);
    }

    if (page) {
      qb.skip(perPage * (page - 1));
    }
    return await qb.getMany();
  }

  async getDMsByOppositeNameCount(
    user: User,
    opposite: User,
    after?: Date,
  ): Promise<number> {
    const qb = this.createQueryBuilder('dm');

    qb.where(
      new Brackets((qb) => {
        const parameters = { userId: user.id, oppositeId: opposite.id };
        qb.where(
          'dm.senderId = :userId AND dm.receiverId = :oppositeId',
          parameters,
        ).orWhere(
          'dm.senderId = :oppositeId AND dm.receiverId = :userId',
          parameters,
        );
      }),
    );

    if (after) {
      qb.andWhere('dm.createdAt > :after', { after });
    }

    return await qb.getCount();
  }
}
