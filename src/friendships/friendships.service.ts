import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { GetFriendshipsFilterDto } from './dto/get-friendships-filter.dto';
import { UpdateFriendshipStatusDto } from './dto/update-friendship-status.dto';
import { FriendshipsRepository } from './friendships.repository';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(FriendshipsRepository)
    private readonly friendshipsRepository: FriendshipsRepository,
    private readonly usersService: UsersService,
  ) {}

  getFriendships(user: User, filterDto: GetFriendshipsFilterDto) {
    return undefined;
  }

  createFriendship(requester: User, createFriendshipDto: CreateFriendshipDto) {
    return undefined;
  }

  deleteFriendship(user: User, opponentName: string) {
    return undefined;
  }

  updateFriendshipStatus(
    user: User,
    opponentName: string,
    updateFriendshipStatusDto: UpdateFriendshipStatusDto,
  ) {
    return undefined;
  }

  getFriends(user: User) {
    return undefined;
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
