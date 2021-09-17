import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementName } from 'src/users/constants/achievement-name.enum';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { FriendshipRole } from './friendship-role.enum';
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

  async createFriendship(
    requester: User,
    addresseeName: string,
  ): Promise<Friendship> {
    if (addresseeName === requester.name) {
      throw new ConflictException(['Cannot add yourself']);
    }

    const addressee: User = await this.usersService.getUserByName(
      addresseeName,
    );
    return this.friendshipsRepository.createFriendship(requester, addressee);
  }

  async getFriendshipByName(
    user: User,
    opponentName: string,
    exception: boolean,
  ): Promise<Friendship> {
    if (opponentName === user.name) {
      throw new ConflictException(['Cannot get yours.']);
    }

    const opponent: User = await this.usersService.getUserByName(opponentName);

    const friendships: Friendship[] = (
      await this.friendshipsRepository.getFriendshipsBetweenUsers(
        user,
        opponent,
      )
    ).sort((a: Friendship) => (a.requester.id === user.id ? -1 : 1));

    if (!friendships.length) {
      if (exception === false) {
        return undefined;
      }
      throw new NotFoundException([
        `Friendhip between ${user.name} and ${opponentName} not found.`,
      ]);
    }

    for (const friendship of friendships) {
      if (friendship.status === FriendshipStatus.BLOCKED) {
        return friendship;
      }
    }

    for (const friendship of friendships) {
      if (friendship.status === FriendshipStatus.ACCEPTED) {
        return friendship;
      }
    }

    for (const friendship of friendships) {
      if (friendship.status === FriendshipStatus.REQUESTED) {
        return friendship;
      }
    }

    for (const friendship of friendships) {
      if (friendship.status === FriendshipStatus.DECLINED) {
        return friendship;
      }
    }

    return friendships[0];
  }

  async deleteFriendship(
    requester: User,
    addresseeName: string,
  ): Promise<void> {
    if (addresseeName === requester.name) {
      throw new ConflictException(['Cannot delete yourself']);
    }

    const addressee: User = await this.usersService.getUserByName(
      addresseeName,
    );

    const result = await this.friendshipsRepository.delete({
      requester,
      addressee,
      status: FriendshipStatus.REQUESTED,
    });

    if (result.affected === 0) {
      throw new NotFoundException([
        `Friendship with ${addresseeName} which status is ${FriendshipStatus.REQUESTED} not found.`,
      ]);
    }
  }

  async updateFriendshipStatus(
    requesterName: string,
    addressee: User,
    status: FriendshipStatus,
  ): Promise<Friendship> {
    if (requesterName === addressee.name) {
      throw new ConflictException(['Cannot delete yourself']);
    }

    const requester: User = await this.usersService.getUserByName(
      requesterName,
    );

    const friendship: Friendship = await this.friendshipsRepository.findOne({
      requester,
      addressee,
    });

    if (!friendship || friendship.status !== FriendshipStatus.REQUESTED) {
      throw new NotFoundException([
        'There is no friendship that you are requested.',
      ]);
    }

    friendship.status = status;

    try {
      await this.friendshipsRepository.save(friendship);
    } catch (error) {
      throw new InternalServerErrorException([
        'Something wrong while saving friendship in updateFriendshipStatus',
      ]);
    }

    return friendship;
  }

  async getFriends(
    user: User,
    me?: FriendshipRole,
    status?: FriendshipStatus,
    perPage?: number,
    page?: number,
  ): Promise<User[]> {
    const options: any = { order: { updatedAt: 'DESC' } };

    let where = [
      { requester: user, status: FriendshipStatus.ACCEPTED },
      { addressee: user, status: FriendshipStatus.ACCEPTED },
    ];

    if (me) {
      where = where.filter((e: any) => Object.keys(e)[0] === me.toLowerCase());
      if (!status) {
        throw new BadRequestException([
          'me query must need follwing status query.',
        ]);
      }
    }

    if (status) {
      where = where.map((e: any) => ({ ...e, status }));
    }

    options.where = where;

    if (perPage) {
      options.take = perPage;
    }

    if (page) {
      options.skip = perPage * (page - 1);
    }

    const [data] = await this.friendshipsRepository.findAndCount(options);

    // REVIEW 서로 수락한 경우, 친구 중복이 발생할 수 있다. 서로 수락한 경우가 안생기게 확인하기, DB를 임의조작하지 않는 이상 생기는 케이스는 아님.
    const users: User[] = data.reduce((acc: User[], cur: Friendship) => {
      if (cur.requester.id === user.id) {
        acc.push(cur.addressee);
      }
      if (cur.addressee.id === user.id) {
        acc.push(cur.requester);
      }
      return acc;
    }, []);

    return users;
  }

  async deleteFriend(user: User, opponentName: string): Promise<void> {
    if (opponentName === user.name) {
      throw new ConflictException(['Cannot delete yourself']);
    }

    const opponent: User = await this.usersService.getUserByName(opponentName);

    const friendships: Friendship[] = (
      await this.friendshipsRepository.getFriendshipsBetweenUsers(
        user,
        opponent,
      )
    ).filter((e: Friendship) => e.status === FriendshipStatus.ACCEPTED);

    if (!friendships.length) {
      throw new NotFoundException([
        `Friendhip between ${user.name} and ${opponentName} not found.`,
      ]);
    }

    // REVIEW 둘 사이의 친구 관계가 2개 이상이면 모두 삭제된다.
    for (const friendship of friendships) {
      const result = await this.friendshipsRepository.delete({
        requester: friendship.requester,
        addressee: friendship.addressee,
      });

      if (!result.affected) {
        throw new NotFoundException([
          `Friendhip between ${user.name} and ${opponentName} not found.`,
        ]);
      }
    }
  }

  async getBlocks(
    requester: User,
    perPage?: number,
    page?: number,
  ): Promise<User[]> {
    const options: any = { order: { updatedAt: 'DESC' } };

    options.where = { requester, status: FriendshipStatus.BLOCKED };

    if (perPage) {
      options.take = perPage;
    }

    if (page) {
      options.skip = perPage * (page - 1);
    }

    const [data] = await this.friendshipsRepository.findAndCount(options);

    const users: User[] = data.reduce((acc, cur) => {
      acc.push(cur.addressee);
      return acc;
    }, []);

    return users;
  }

  async createBlack(
    requester: User,
    addresseeName: string,
  ): Promise<Friendship> {
    if (addresseeName === requester.name) {
      throw new ConflictException(['Cannot block yourself']);
    }

    const addressee: User = await this.usersService.getUserByName(
      addresseeName,
    );

    const friendship: Friendship = await this.friendshipsRepository.createBlack(
      requester,
      addressee,
    );

    await this.usersService.createUserAchievement(
      requester,
      AchievementName.FIRST_BLOCK,
    );

    return friendship;
  }

  async deleteBlack(requester: User, addresseeName: string): Promise<void> {
    if (addresseeName === requester.name) {
      throw new ConflictException(['Cannot unblock yourself']);
    }

    const addressee: User = await this.usersService.getUserByName(
      addresseeName,
    );

    const result = await this.friendshipsRepository.delete({
      requester,
      addressee,
      status: FriendshipStatus.BLOCKED,
    });

    if (result.affected === 0) {
      throw new NotFoundException([
        `Friendship with ${addresseeName} which status is ${FriendshipStatus.BLOCKED} not found.`,
      ]);
    }
  }
}
