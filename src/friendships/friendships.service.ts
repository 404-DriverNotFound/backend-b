import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { FriendshipStatus } from './friendship-status.enum';
import { Friendship } from './friendship.entity';
import { FriendshipsRepository } from './friendships.repository';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(FriendshipsRepository)
    private readonly friendshipsRepository: FriendshipsRepository,
    private readonly usersService: UsersService,
  ) {}

  getFriendships(user: User, status: FriendshipStatus): Promise<Friendship[]> {
    return this.friendshipsRepository.find({ addressee: user, status });
  }

  async createFriendship(
    requester: User,
    addresseeName: string,
  ): Promise<Friendship> {
    if (addresseeName === requester.name) {
      throw new ConflictException('Cannot add yourself');
    }

    const addressee: User = await this.usersService.getUserByName(
      addresseeName,
    );
    return this.friendshipsRepository.createFriendship(requester, addressee);
  }

  async deleteFriendship(
    requester: User,
    addresseeName: string,
  ): Promise<void> {
    if (addresseeName === requester.name) {
      throw new ConflictException('Cannot delete yourself');
    }

    const addressee: User = await this.usersService.getUserByName(
      addresseeName,
    );

    const result = await this.friendshipsRepository.delete({
      requester,
      addressee,
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Friendship with ${addresseeName} not found.`,
      );
    }
  }

  async updateFriendshipStatus(
    requesterName: string,
    addressee: User,
    status: FriendshipStatus,
  ): Promise<Friendship> {
    if (requesterName === addressee.name) {
      throw new ConflictException('Cannot delete yourself');
    }

    const requester: User = await this.usersService.getUserByName(
      requesterName,
    );

    const friendship: Friendship = await this.friendshipsRepository.findOne({
      requester,
      addressee,
    });

    if (!friendship || friendship.status !== FriendshipStatus.REQUESTED) {
      throw new NotFoundException(
        'There is no friendship that you are requested.',
      );
    }

    friendship.status = status;

    try {
      await this.friendshipsRepository.save(friendship);
    } catch (error) {
      throw new InternalServerErrorException(
        'Something wrong while saving friendship in updateFriendshipStatus',
      );
    }

    return friendship;
  }

  async getFriends(user: User): Promise<User[]> {
    const where = [
      { requester: user, status: FriendshipStatus.ACCEPTED },
      { addressee: user, status: FriendshipStatus.ACCEPTED },
    ];
    const friendships: Friendship[] = await this.friendshipsRepository.find({
      where,
    });
    const users: User[] = [];
    for (const friendship of friendships) {
      if (friendship.requester.id === user.id) {
        users.push(friendship.addressee);
      }
      if (friendship.addressee.id === user.id) {
        users.push(friendship.requester);
      }
    }
    // REVIEW 서로 수락한 경우, 친구 중복이 발생할 수 있다. 서로 수락한 경우가 안생기게 확인하기
    return users;
  }

  async deleteFriend(user: User, opponentName: string): Promise<void> {
    if (opponentName === user.name) {
      throw new ConflictException('Cannot delete yourself');
    }

    const opponent: User = await this.usersService.getUserByName(opponentName);

    const friendships: Friendship[] = (
      await this.friendshipsRepository.getFriendshipsBetweenUsers(
        user,
        opponent,
      )
    ).filter((e: Friendship) => e.status === FriendshipStatus.ACCEPTED);

    if (!friendships.length) {
      throw new NotFoundException(
        `Friendhip between ${user.name} and ${opponentName} not found.`,
      );
    }

    // REVIEW 둘 사이의 친구 관계가 2개 이상이면 모두 삭제된다.
    for (const friendship of friendships) {
      const result = await this.friendshipsRepository.delete({
        requester: friendship.requester,
        addressee: friendship.addressee,
      });

      if (!result.affected) {
        throw new NotFoundException(
          `Friendhip between ${user.name} and ${opponentName} not found.`,
        );
      }
    }
  }

  async getBlacks(requester: User): Promise<User[]> {
    const friendships: Friendship[] = await this.friendshipsRepository.find({
      requester,
      status: FriendshipStatus.BLOCKED,
    });

    const users: User[] = [];

    for (const friendship of friendships) {
      users.push(friendship.addressee);
    }

    return users;
  }

  async createBlack(
    requester: User,
    addresseeName: string,
  ): Promise<Friendship> {
    if (addresseeName === requester.name) {
      throw new ConflictException('Cannot block yourself');
    }

    const addressee: User = await this.usersService.getUserByName(
      addresseeName,
    );
    return this.friendshipsRepository.createBlack(requester, addressee);
  }

  deleteBlack(user: User, opponentName: string) {
    return undefined;
  }
}
