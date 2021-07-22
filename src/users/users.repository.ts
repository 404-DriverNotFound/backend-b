import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, avatar = 'default.svg' } = createUserDto;
    const user: User = this.create({
      name,
      avatar,
      ftId: 1234,
      email: 'e@mail.com',
    });
    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate name
        throw new ConflictException('User name is already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return user;
  }
}
