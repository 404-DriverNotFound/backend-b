import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async getUserByName(name: string): Promise<User> {
    const found: User = await this.findOne({ name });
    if (!found) {
      throw new NotFoundException(`User with ${name} not found`);
    }
    return found;
  }

  async createUser(
    ftId: number,
    name: string,
    enable2FA: boolean,
    avatar?: string,
  ): Promise<User> {
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
        throw new InternalServerErrorException('Error in createUser');
      }
    }
    return user;
  }

  async updateUser(
    user: User,
    name?: string,
    enable2FA?: boolean,
    avatar?: string,
  ): Promise<User> {
    if (name) {
      user.name = name;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    if (enable2FA) {
      user.enable2FA = enable2FA;
      user.isSecondFactorAuthenticated = true; // REVIEW 업데이트하고 바로 인증으로 넘어가지 않고, 재로그인시 검사
      user.authenticatorSecret = null;
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
        throw new InternalServerErrorException('Error in updateUser');
      }
    }
    return user;
  }
}
