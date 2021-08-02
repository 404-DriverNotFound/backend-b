import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async getUserById(id: string): Promise<User> {
    const found: User = await this.findOne({ id });
    if (!found) {
      throw new NotFoundException(`User with ${id} not found`);
    }
    return found;
  }

  async createUser(ftId: number, createUserDto: CreateUserDto): Promise<User> {
    const {
      name,
      avatar = 'default.svg',
      enable2FA,
    }: CreateUserDto = createUserDto;
    const user: User = this.create({
      ftId,
      name,
      avatar,
      enable2FA,
    });
    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // NOTE someting duplicated ftId or name
        throw new ConflictException('User is already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return user;
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    const { name, avatar, enable2FA } = updateUserDto;
    if (name) {
      user.name = name;
    }
    if (avatar) {
      user.avatar = avatar;
    }
    if (enable2FA) {
      user.enable2FA = enable2FA;
    }
    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // NOTE someting duplicated ftId or name
        throw new ConflictException(
          'someting duplicated in databases(maybe name?)',
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
    return user;
  }
}
