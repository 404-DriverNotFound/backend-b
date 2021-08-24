import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { Friendship } from './friendship.entity';
import { FriendshipsRepository } from './friendships.repository';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(FriendshipsRepository)
    private readonly friendshipsRepository: FriendshipsRepository,
    private readonly usersService: UsersService,
  ) {}

  //async createFriendship(
  //  requester: User,
  //  { addresseeName, status }: CreateFriendshipDto,
  //): Promise<Friendship> {
  //  if (requester.name === addresseeName) {
  //    throw new ConflictException("You can't add yourself.");
  //  }

  //  const addressee: User = await this.usersService.getUserByName(
  //    addresseeName,
  //  );

  //  return this.friendshipsRepository.createFriendship(
  //    requester,
  //    addressee,
  //    status,
  //  );
  //}
}
