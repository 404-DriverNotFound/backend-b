import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersRepository } from 'src/users/users.repository';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { GetFriendshipsFilterDto } from './dto/get-friendships-filter.dto';
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
    const { addresseeName } = createFriendshipDto;
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

    return this.friendshipsRepository.createFriendship(requester, addressee);
  }
}