import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Friendship } from './friendship.entity';

@EntityRepository(Friendship)
export class FriendshipsRepository extends Repository<Friendship> {
  async getFriendshipsBetweenUsers(
    user1: User,
    user2: User,
  ): Promise<Friendship[]> {
    const where = [
      { requester: user1, addressee: user2 },
      { requester: user2, addressee: user1 },
    ];

    const friendships: Friendship[] = await this.find({ where });

    return friendships;
  }

  async createFriendship(
    requester: User,
    addressee: User,
  ): Promise<Friendship> {
    const friendships: Friendship[] = await this.getFriendshipsBetweenUsers(
      requester,
      addressee,
    );

    if (friendships) {
      throw new ConflictException(
        `There is a friendship with ${addressee.name}.`,
      );
    }

    const friendship: Friendship = this.create({
      requester,
      addressee,
    });

    try {
      await this.insert(friendship);
    } catch (error) {
      throw new InternalServerErrorException(
        'Someting wrong while saving a friendship data in createFriendship.',
      );
    }

    return friendship;
  }

  //  async deleteFriendshipById(user: User, id: string): Promise<void> {
  //    const qb = this.createQueryBuilder('friendship');
  //    const result = await qb
  //      .delete()
  //      .where('id = :id AND requesterId = :userId', {
  //        id,
  //        userId: user.id,
  //      })
  //      .orWhere('id = :id AND addresseeId = :userId', {
  //        id,
  //        userId: user.id,
  //      })
  //      .execute();
  //    if (result.affected === 0) {
  //      throw new NotFoundException(`Friendship with id: ${id} not found.`);
  //    }
  //  }
}
