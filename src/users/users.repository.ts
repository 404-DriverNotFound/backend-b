import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
//import { UserStatus } from './user-status.enum';
import { User } from './user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, avatar } = createUserDto;
    const user: User = this.create({
      ftId: 1234,
      name,
      avatar,
      //status: UserStatus.OFFLINE,
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
