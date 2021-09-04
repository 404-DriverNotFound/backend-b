import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { buildPaginator, PagingQuery } from 'typeorm-cursor-pagination';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { Channel } from 'src/channels/entities/channel.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async getUsers({
    search,
    limit,
    beforeCursor,
    afterCursor,
  }: GetUsersFilterDto) {
    const qb = this.createQueryBuilder('user');

    if (search) {
      qb.andWhere('user.name LIKE :search', { search: `%${search}%` });
    }

    if (limit) {
      let query: PagingQuery = { limit: +limit, order: 'ASC' };

      if (afterCursor) {
        query = { afterCursor, ...query };
      }

      if (beforeCursor) {
        query = { beforeCursor, ...query };
      }

      const paginator = buildPaginator({
        entity: User,
        paginationKeys: ['name'],
        query,
      });

      return await paginator.paginate(qb);
    }

    try {
      const users: User[] = await qb.getMany();
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Server error in getUsers');
    }
  }

  async getUserByName(name: string): Promise<User> {
    const found: User = await this.findOne({ name });
    if (!found) {
      throw new NotFoundException(`User with ${name} not found`);
    }
    return found;
  }

  async createUser(
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ): Promise<User> {
    const { ftId, name, enable2FA } = createUserDto;
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
    const { name, enable2FA } = updateUserDto;
    if (name) {
      user.name = name;
    }
    if (file) {
      user.avatar = file.path;
    }
    if (enable2FA) {
      user.enable2FA = enable2FA === 'true';
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

  async getChannelMembers(
    channel: Channel,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<User[]> {
    const qb = this.createQueryBuilder('user');

    qb.innerJoin(
      'user.memberships',
      'memberships',
      'memberships.channelId = :id',
      { id: channel.id },
    );

    if (search) {
      qb.andWhere('user.name LIKE :search', { search: `%${search}%` });
    }

    if (perPage) {
      qb.take(perPage);
    }

    if (page) {
      qb.skip(perPage * (page - 1));
    }

    try {
      const users: User[] = await qb.getMany();
      return users;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
