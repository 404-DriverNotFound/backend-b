import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { FriendshipStatus } from './friendship-status.enum';
import { Friendship } from './friendship.entity';

@EntityRepository(Friendship)
export class FriendshipsRepository extends Repository<Friendship> {
  async createFriendship(
    requester: User,
    addressee: User,
  ): Promise<Friendship> {
    // NOTE DECLINE을 제외한 friendship이 이미 존재한다면 추가 x
    // TODO 상대가 거절했을 때는 추가 가능 2회이상 거절하면 추가안되게?
    const where = [
      { requester, addressee },
      { requester: addressee, addressee: requester },
    ];
    const friendships: Friendship[] = (await this.find({ where })).filter(
      (e) => e.status !== FriendshipStatus.DECLINE,
    );

    if (friendships.length) {
      throw new ConflictException(
        `There is a friendship between ${requester.name} and ${addressee.name}.`,
      );
    }

    const friendship: Friendship = this.create({
      requester,
      addressee,
    });

    try {
      await this.save(friendship);
    } catch (error) {
      throw new InternalServerErrorException(
        'Someting wrong while saving a friendship data in createFriendship.',
      );
    }
    return friendship;
  }
}
