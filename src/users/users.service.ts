import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/channels/entities/channel.entity';
import { Like } from 'typeorm';
import { UserStatus } from './constants/user-status.enum';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async getUsers(
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<User[]> {
    const options: any = { order: { name: 'ASC' } };

    if (search) {
      options.where = { name: Like(`%${search}%`) };
    }

    if (perPage) {
      options.take = perPage;
    }

    if (page) {
      options.skip = perPage * (page - 1);
    }

    const [data] = await this.usersRepository.findAndCount(options);

    return data;
  }

  async isDuplicated(name: string): Promise<User> {
    const found: User = await this.usersRepository.findOne({ name });
    if (!found) {
      throw new NotFoundException([`User with ${name} not found`]);
    }
    return found;
  }

  async getUserByName(name: string): Promise<User> {
    const found: User = await this.usersRepository.findOne({ name });
    if (!found) {
      throw new NotFoundException([`User with ${name} not found`]);
    }
    return found;
  }

  createUser(
    ftId: number,
    name: string,
    enable2FA: boolean,
    avatar?: string,
  ): Promise<User> {
    return this.usersRepository.createUser(ftId, name, enable2FA, avatar);
  }

  updateUser(
    user: User,
    name?: string,
    enable2FA?: boolean,
    avatar?: string,
  ): Promise<User> {
    return this.usersRepository.updateUser(user, name, enable2FA, avatar);
  }

  async updateUserStatus(user: User, status: UserStatus): Promise<User> {
    user.status = status;
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException([
        'server error in updateUserStatus',
      ]);
    }
    return user;
  }

  async updateUserIsSecondFactorUnauthenticated(user: User): Promise<User> {
    user.isSecondFactorAuthenticated = false;
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException([
        'server error in updateUserIsSecondFactorUnauthenticated',
      ]);
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
      throw new InternalServerErrorException([
        'server error in updateUserAuthenticatorSecret',
      ]);
    }
    return user;
  }

  getChannelMembers(
    channel: Channel,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<User[]> {
    return this.usersRepository.getChannelMembers(
      channel,
      search,
      perPage,
      page,
    );
  }
}
