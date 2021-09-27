import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Channel } from 'src/channels/entities/channel.entity';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async getUserByName(name: string): Promise<User> {
    const found: User = await this.findOne({ name });
    if (!found) {
      throw new NotFoundException([`User with ${name} not found`]);
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
        throw new ConflictException(['User is already exists']);
      } else {
        throw new InternalServerErrorException(['Error in createUser']);
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

    if (enable2FA !== undefined) {
      user.enable2FA = enable2FA;
      user.isSecondFactorAuthenticated = true; // REVIEW 업데이트하고 바로 인증으로 넘어가지 않고, 재로그인시 검사
      user.authenticatorSecret = null;
    }

    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // NOTE someting duplicated ftId or name
        throw new ConflictException([
          'someting duplicated in databases(maybe name?)',
        ]);
      } else {
        throw new InternalServerErrorException(['Error in updateUser']);
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

    qb.innerJoinAndSelect(
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

  async getDMers(user: User, perPage?: number, page?: number): Promise<User[]> {
    //NOTE Query version
    //const qb = this.createQueryBuilder('user')
    //  .leftJoin('user.senderDms', 'senderDms')
    //  .leftJoin('user.receiverDms', 'receiverDms')
    //  .where(
    //    '(receiverDms.senderId = :id AND receiverDms.receiverId != :id) OR (senderDms.senderId != :id AND senderDms.receiverId = :id)',
    //    {
    //      id: user.id,
    //    },
    //  );

    //NOTE Brackets version
    const parameters = { id: user.id };
    const qb = this.createQueryBuilder('user')
      .leftJoin('user.senderDms', 'senderDms')
      .leftJoin('user.receiverDms', 'receiverDms')
      .where(
        new Brackets((qb) => {
          qb.where('receiverDms.senderId = :id', parameters);
          qb.andWhere('receiverDms.receiverId != :id', parameters);
        }),
      )
      .orWhere(
        new Brackets((qb) => {
          qb.where('senderDms.senderId != :id', parameters);
          qb.andWhere('senderDms.receiverId = :id', parameters);
        }),
      );

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
