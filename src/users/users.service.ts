import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserStatus } from './user-status.enum';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  // NOTE 추 후에 auth/signup에서 repository로 직접 createUser를 호출 할 것임으로 삭제할 예정
  createUser(createUserDto: CreateUserDto, avatar: string): Promise<User> {
    return this.usersRepository.createUser(createUserDto, avatar);
  }

  findAll() {
    return `This action returns all users`;
  }

  async getUserByName(name: string): Promise<User> {
    const found = await this.usersRepository.findOne({ name });
    if (!found) {
      throw new NotFoundException(`User with name: ${name} not found`);
    }
    return found;
  }

  async updateUserStatus(name: string, status: UserStatus): Promise<User> {
    const user = await this.getUserByName(name);
    user.status = status;
    await this.usersRepository.save(user);
    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
