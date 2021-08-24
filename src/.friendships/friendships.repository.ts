import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { GetFriendshipsFilterDto } from './dto/get-friendships-filter.dto';
import { FriendshipStatus } from './friendship-status.enum';
import { Friendship } from './friendship.entity';

@EntityRepository(Friendship)
export class FriendshipsRepository extends Repository<Friendship> {
  async getFriendships(
    user: User,
    filterDto: GetFriendshipsFilterDto,
  ): Promise<Friendship[]> {
    const { status } = filterDto;
    let where = [{ requester: user }, { addressee: user }];
    if (status) {
      where = where.map((e) => ({ ...e, status }));
    }

    return (await this.find({ where })).filter(
      (e) => e.status !== FriendshipStatus.DECLINE,
    );
  }

  async getFriendshipsByUsers(user1: User, user2: User): Promise<Friendship> {
    const where = [
      { requester: user1, addressee: user2 },
      { requester: user2, addressee: user1 },
    ];
    const friendships: Friendship[] = (await this.find({ where })).filter(
      (e) => e.status !== FriendshipStatus.DECLINE,
    );
    return friendships[0];
  }

  async createFriendship(
    requester: User,
    addressee: User,
    status: FriendshipStatus,
  ): Promise<Friendship> {
    // NOTE DECLINE을 제외한 friendship이 이미 존재한다면 추가 x
    // TODO 상대가 거절했을 때는 추가 가능 2회이상 거절하면 추가안되게?
    let friendship: Friendship = await this.getFriendshipsByUsers(
      requester,
      addressee,
    );
    if (friendship) {
      if (
        friendship.status === FriendshipStatus.BLOCK ||
        status !== FriendshipStatus.BLOCK
      ) {
        throw new ConflictException(
          `There is a friendship between ${requester.name} and ${addressee.name}.`,
        );
      }
      friendship.status = status;
    } else {
      friendship = this.create({
        requester,
        addressee,
        status,
      });
    }

    try {
      await this.save(friendship);
    } catch (error) {
      throw new InternalServerErrorException(
        'Someting wrong while saving a friendship data in createFriendship.',
      );
    }
    return friendship;
  }

  async deleteFriendshipById(user: User, id: string): Promise<void> {
    const qb = this.createQueryBuilder('friendship');
    const result = await qb
      .delete()
      .where('id = :id AND requesterId = :userId', {
        id,
        userId: user.id,
      })
      .orWhere('id = :id AND addresseeId = :userId', {
        id,
        userId: user.id,
      })
      .execute();
    if (result.affected === 0) {
      throw new NotFoundException(`Friendship with id: ${id} not found.`);
    }
  }
}
