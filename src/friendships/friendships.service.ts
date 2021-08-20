import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersRepository } from 'src/users/users.repository';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { GetFriendshipsFilterDto } from './dto/get-friendships-filter.dto';
import { FriendshipStatus } from './friendship-status.enum';
import { Friendship } from './friendship.entity';
import { FriendshipsRepository } from './friendships.repository';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(FriendshipsRepository)
    private readonly friendshipsRepository: FriendshipsRepository,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  getFriendships(
    user: User,
    filterDto: GetFriendshipsFilterDto,
  ): Promise<Friendship[]> {
    return this.friendshipsRepository.getFriendships(user, filterDto);
  }

  async createFriendship(
    requester: User,
    createFriendshipDto: CreateFriendshipDto,
  ): Promise<Friendship> {
    const { addresseeName, status } = createFriendshipDto;
    if (requester.name === addresseeName) {
      throw new BadRequestException("You can't add yourself.");
    }

    const addressee: User = await this.usersRepository.findOne({
      name: addresseeName,
    });
    if (!addressee) {
      throw new NotFoundException(
        `Addressee with name: ${addresseeName} not found.`,
      );
    }

    return this.friendshipsRepository.createFriendship(
      requester,
      addressee,
      status,
    );
  }

  async updateFriendshipStatus(
    user: User,
    id: string,
    status: FriendshipStatus,
  ): Promise<Friendship> {
    const friendship: Friendship = await this.friendshipsRepository.findOne(id);
    if (!friendship) {
      throw new NotFoundException(`Friendship with id: ${id} not found.`);
    }

    if (
      friendship.addressee.id !== user.id &&
      friendship.requester.id !== user.id
    ) {
      throw new BadRequestException(
        "You can't update a friendship status not yours.",
      );
    }

    friendship.status = status;
    try {
      await this.friendshipsRepository.save(friendship);
    } catch (error) {
      throw new InternalServerErrorException(
        'Someting wrong while updating a friendship data in updateFriendshipStatus.',
      );
    }
    return friendship;
  }

  deleteFriendshipById(user: User, id: string): Promise<void> {
    return this.friendshipsRepository.deleteFriendshipById(user, id);
  }
}
