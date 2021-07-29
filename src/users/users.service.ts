import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/permission.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async getUserById(id: string): Promise<User> {
    const found: User = await this.usersRepository.findOne({ id });
    if (!found) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
    return found;
  }

  async updateUserById(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const found: User = await this.getUserById(id);
    const { name, avatar } = updateUserDto;
    found.name = name;
    if (avatar) {
      found.avatar = avatar;
    }
    if (!found.permissions.includes(Permission.ACCESS)) {
      found.permissions.push(Permission.ACCESS);
    }
    try {
      await this.usersRepository.save(found);
    } catch (error) {
      if (error.code === '23505') {
        // NOTE duplicate name
        throw new ConflictException('User name is already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return found;
  }
}
