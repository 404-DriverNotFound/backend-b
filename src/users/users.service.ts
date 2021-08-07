import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  getUserById(id: string): Promise<User> {
    return this.usersRepository.getUserById(id);
  }

  getUserByName(name: string): Promise<User> {
    return this.usersRepository.getUserByName(name);
  }

  createUser(
    user: User,
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ): Promise<User> {
    const { ftId } = user;
    return this.usersRepository.createUser(+ftId, createUserDto, file);
  }

  updateUser(
    user: User,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ): Promise<User> {
    return this.usersRepository.updateUser(user, updateUserDto, file);
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
