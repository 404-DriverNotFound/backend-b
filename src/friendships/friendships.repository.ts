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

    for (const friendship of friendships) {
      if (friendship.requester.id === requester.id) {
        // NOTE requseter req.user
        switch (friendship.status) {
          case FriendshipStatus.REQUESTED:
            throw new ConflictException(
              `You already requested to ${addressee.name}.`,
            );
          case FriendshipStatus.ACCEPTED:
            throw new ConflictException(
              `You are already friends of ${addressee.name}.`,
            );
          case FriendshipStatus.BLOCKED:
            throw new ConflictException(`You blocked ${addressee.name}.`);
        }
      } else {
        // NOTE addressee req.user
        switch (friendship.status) {
          case FriendshipStatus.REQUESTED:
            throw new ConflictException(
              `Accept request of ${addressee.name} first.`,
            );
          case FriendshipStatus.ACCEPTED:
            throw new ConflictException(
              `You are already friends of ${addressee.name}.`,
            );
          case FriendshipStatus.BLOCKED:
            throw new ConflictException(
              `You are blocked by ${addressee.name}.`,
            );
        }
      }
    }

    const friendship: Friendship = this.create({
      requester,
      addressee,
      status: FriendshipStatus.REQUESTED,
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

  async createBlack(requester: User, addressee: User): Promise<Friendship> {
    const friendship: Friendship = this.create({
      requester,
      addressee,
      status: FriendshipStatus.BLOCKED,
    });

    try {
      await this.save(friendship);
    } catch (error) {
      throw new InternalServerErrorException(
        'Someting wrong while saving a friendship data in createBlack.',
      );
    }

    const found: Friendship = await this.findOne({
      requester: addressee,
      addressee: requester,
    });

    if (found && found.status !== FriendshipStatus.BLOCKED) {
      await this.delete({ requester: addressee, addressee: requester });
    }

    return friendship;
  }
}
