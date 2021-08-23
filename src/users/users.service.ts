import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from 'src/friendships/friendship.entity';
import { FriendshipsRepository } from 'src/friendships/friendships.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './user-status.enum';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @InjectRepository(FriendshipsRepository)
    private readonly friendshipsRepository: FriendshipsRepository,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async isDuplicated(name: string): Promise<User> {
    const found: User = await this.usersRepository.findOne({ name });
    if (!found) {
      throw new NotFoundException(`User with ${name} not found`);
    }
    return found;
  }

  async getUserByName(user: User, name: string): Promise<User> {
    const found: User = await this.usersRepository.findOne({ name });
    if (!found) {
      throw new NotFoundException(`User with ${name} not found`);
    }
    const friendship: Friendship =
      await this.friendshipsRepository.getFriendshipsByUsers(user, found);
    found.friendship = friendship;
    return found;
  }

  createUser(
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ): Promise<User> {
    return this.usersRepository.createUser(createUserDto, file);
  }

  updateUser(
    user: User,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ): Promise<User> {
    return this.usersRepository.updateUser(user, updateUserDto, file);
  }

  async updateUserStatus(user: User, status: UserStatus): Promise<User> {
    user.status = status;
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        'server error in updateUserStatus',
      );
    }
    return user;
  }

  async updateUserIsSecondFactorUnauthenticated(user: User): Promise<User> {
    user.isSecondFactorAuthenticated = false;
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        'server error in updateUserIsSecondFactorUnauthenticated',
      );
    }
    return user;
  }

  async updateUserAuthenticatorSecret(
    user: User,
    secret: string,
  ): Promise<User> {
    user.authenticatorSecret = secret;
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        'server error in updateUserAuthenticatorSecret',
      );
    }
    return user;
  }
}
