import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  getUserByName(name: string): Promise<User> {
    return this.usersRepository.getUserByName(name);
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
