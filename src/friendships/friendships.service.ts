import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { GetFriendshipsFilterDto } from './dto/get-friendships-filter.dto';
import { UpdateFriendshipStatusDto } from './dto/update-friendship-status.dto';
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
    // REVIEW 서로 수락한 경우, 중복이 발생할 수 있다. 서로 수락한 경우가 안생기게 확인하기
    return users;
  }

  deleteFriend(user: User, opponentName: string) {
    return undefined;
  }

  getBlacks(user: User) {
    return undefined;
  }

  createBlack(requester: User, createFriendshipDto: CreateFriendshipDto) {
    return undefined;
  }

  deleteBlack(user: User, opponentName: string) {
    return undefined;
  }
}
