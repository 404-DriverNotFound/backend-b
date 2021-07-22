import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserStatus } from './user-status.enum';
import { User } from './user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(
    createUserDto: CreateUserDto,
    avatar = 'default.png',
  ): Promise<User> {
    const { name } = createUserDto;
    const user: User = this.create({
      ftId: 1234,
      name,
      avatar,
      status: UserStatus.OFFLINE,
      email: 'e@mail.com',
    });
    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate name
        throw new ConflictException('User name is already exists');
      } else {
        throw new InternalServerErrorException(
          'Unexpected server error when saving user',
        );
      }
    }
    return user;
  }
}
