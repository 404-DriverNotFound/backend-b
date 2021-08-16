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
  async getUserByName(name: string): Promise<User> {
    const found: User = await this.findOne({ name });
    if (!found) {
      throw new NotFoundException(`User with ${name} not found`);
    }
    return found;
  }

  async createUser(
    ftId: number,
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ): Promise<User> {
    const { name, enable2FA } = createUserDto;
    const user: User = this.create({
      ftId,
      name,
      avatar: file?.path,
      enable2FA: enable2FA === 'true',
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
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ): Promise<User> {
    const { name, enable2FA, status } = updateUserDto;
    if (name) {
      user.name = name;
    }
    if (file) {
      user.avatar = file.path;
    }
    if (enable2FA === 'true') {
      user.enable2FA = enable2FA === 'true';
      user.isSecondFactorAuthenticated = true; // REVIEW 업데이트하고 바로 인증으로 넘어가지 않고, 재로그인시 검사
    }
    if (status) {
      user.status = status;
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
