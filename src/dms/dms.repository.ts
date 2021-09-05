import { User } from 'src/users/user.entity';
import { Brackets, EntityRepository, ObjectLiteral, Repository } from 'typeorm';
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
    const qb = this.createQueryBuilder('dm').where(
      new Brackets((qb) => {
        const parameters: ObjectLiteral = {
          userId: user.id,
          oppositeId: opposite.id,
        };
        qb.where(
          'dm.senderId = :userId AND dm.receiverId = :oppositeId',
          parameters,
        ).orWhere(
          'dm.senderId = :oppositeId AND dm.receiverId = :userId',
          parameters,
        );
      }),
    );

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
}
