import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelsRepository } from './repositories/channels.repository';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { Like } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { MembershipsRepository } from './repositories/memberships.repository';
import { UsersService } from 'src/users/users.service';
import { MembershipRole } from './membership-role.enum';
import { Chat } from './entities/chat.entity';
import { ChatsRepository } from './repositories/chats.repository';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(ChannelsRepository)
    private readonly channelsRepository: ChannelsRepository,
    @InjectRepository(MembershipsRepository)
    private readonly membershipsRepository: MembershipsRepository,
    @InjectRepository(ChatsRepository)
    private readonly chatsRepository: ChatsRepository,
  ) {}

  async getChannels(
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Channel[]> {
    const options: any = { order: { createdAt: 'DESC' } };

    if (search) {
      options.where = { name: Like(`%${search}%`) };
    }

    if (perPage) {
      options.take = perPage;
    }

    if (page) {
      options.skip = perPage * (page - 1);
    }

    const [data] = await this.channelsRepository.findAndCount(options);

    return data;
  }

  getChannelsByMe(
    user: User,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Channel[]> {
    return this.channelsRepository.getChannelsByMe(user, search, perPage, page);
  }

  async getChannelByName(name: string): Promise<Channel> {
    const channel: Channel = await this.channelsRepository.findOne({ name });
    if (!channel) {
      throw new NotFoundException('Channel you requested is not found!');
    }
    return channel;
  }

  async createChannel(
    user: User,
    name: string,
    password?: string,
  ): Promise<Channel> {
    if (password) {
      const salt: string = await bcrypt.genSalt();
      password = await bcrypt.hash(password, salt);
    }

    const channel: Channel = this.channelsRepository.create({ name, password });

    try {
      await this.channelsRepository.save(channel);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate channel
        throw new ConflictException('Channel is already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }

    const membership: Membership = this.membershipsRepository.create({
      channel,
      user,
      role: MembershipRole.OWNER,
    });

    try {
      await this.membershipsRepository.save(membership);
    } catch (error) {
      console.log(error);
      if (error.code === '23505') {
        // duplicate channel
        throw new ConflictException('Membership is already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return channel;
  }

  async updateChannelPassword(
    owner: User,
    name: string,
    password?: string,
  ): Promise<Channel> {
    const channel: Channel = await this.channelsRepository.findOne({
      name,
    });

    if (password) {
      const salt: string = await bcrypt.genSalt();
      channel.password = await bcrypt.hash(password, salt);
    } else {
      channel.password = null;
    }

    await this.channelsRepository.save(channel);

    return channel;
  }

  async createChannelMember(
    name: string,
    password: string,
    memberName: string,
  ) {
    const channel: Channel = await this.getChannelByName(name);

    const isCorrect: boolean = await bcrypt.compare(password, channel.password);

    if (!isCorrect) {
      throw new UnauthorizedException('Invalid password.');
    }

    const user: User = await this.usersService.getUserByName(memberName);

    const membership: Membership = this.membershipsRepository.create({
      channel,
      user,
    });

    try {
      await this.membershipsRepository.insert(membership);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Membership is already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }

    return membership;
  }

  async getChannelMembers(
    name: string,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<User[]> {
    const channel: Channel = await this.getChannelByName(name);

    return await this.usersService.getChannelMembers(
      channel,
      search,
      perPage,
      page,
    );
  }

  async deleteChannelMember(name: string, memberName: string): Promise<void> {
    const channel: Channel = await this.getChannelByName(name);
    const user: User = await this.usersService.getUserByName(memberName);
    const membership: Membership = await this.membershipsRepository.findOne({
      channel,
      user,
    });

    const result = await this.membershipsRepository.delete({ channel, user });

    if (!result.affected) {
      throw new NotFoundException(
        `${memberName} is not a member of channel(${name}).`,
      );
    }

    if (membership.role === MembershipRole.OWNER) {
      const admin: Membership = await this.membershipsRepository.findOne({
        where: { channel, role: MembershipRole.ADMIN },
        relations: ['user'],
      });

      if (admin) {
        // NOTE 위임 to admin
        await this.membershipsRepository.save({
          channel,
          user: admin.user,
          role: MembershipRole.OWNER,
        });
      } else {
        const member: Membership = await this.membershipsRepository.findOne({
          where: { channel, role: MembershipRole.MEMBER },
          relations: ['user'],
        });

        if (member) {
          // NOTE 위임
          await this.membershipsRepository.save({
            channel,
            user: member.user,
            role: MembershipRole.OWNER,
          });
        } else {
          // NOTE 채널삭제
          console.log(channel);
          const result = await this.channelsRepository.delete(channel.id);

          if (!result.affected) {
            throw new NotFoundException('Cannot delete Channel');
          }
        }
      }
    }
  }

  async getChannelChats(
    name: string,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Chat[]> {
    const channel: Channel = await this.getChannelByName(name);

    const options: any = { where: { channel }, order: { createdAt: 'DESC' } };

    //REVIEW 채팅 내용 검색 테스트 필요
    if (search) {
      options.where = { ...options.where, content: Like(`%${search}%`) };
    }

    if (perPage) {
      options.take = perPage;
    }

    if (page) {
      options.skip = perPage * (page - 1);
    }

    const [data] = await this.chatsRepository.findAndCount(options);

    return data;
  }
}
