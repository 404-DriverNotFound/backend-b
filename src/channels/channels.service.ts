import {
  ConflictException,
  ForbiddenException,
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
import { Like, MoreThan } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { MembershipsRepository } from './repositories/memberships.repository';
import { UsersService } from 'src/users/users.service';
import { MembershipRole } from './membership-role.enum';
import { Chat } from './entities/chat.entity';
import { ChatsRepository } from './repositories/chats.repository';
import { EventsGateway } from 'src/events/events.gateway';

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
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getChannels(
    user: User,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Channel[]> {
    return this.channelsRepository.getChannels(user, search, perPage, page);
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
      throw new NotFoundException(['Channel you requested is not found!']);
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
        throw new ConflictException(['Channel is already exists']);
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
        throw new ConflictException(['Membership is already exists']);
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
    memberName: string,
    password?: string,
  ) {
    const channel: Channel = await this.getChannelByName(name);

    if (channel.password) {
      if (!password) {
        throw new UnauthorizedException(['Password is required.']);
      }

      const isCorrect: boolean = await bcrypt.compare(
        password,
        channel.password,
      );

      if (!isCorrect) {
        throw new UnauthorizedException(['Invalid password.']);
      }
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
        throw new ConflictException(['Membership is already exists']);
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

  async deleteChannelMember(
    user: User,
    name: string,
    memberName: string,
  ): Promise<void> {
    const channel: Channel = await this.getChannelByName(name);

    const membershipOfRequester: Membership =
      await this.membershipsRepository.findOne({ channel, user });
    if (!membershipOfRequester) {
      throw new NotFoundException([
        `${user.name} is not a member of channel(${name}).`,
      ]);
    }

    const member: User = await this.usersService.getUserByName(memberName);
    const membershipOfMember: Membership =
      await this.membershipsRepository.findOne({
        channel,
        user: member,
      });
    if (!membershipOfMember) {
      throw new NotFoundException([
        `${member.name} is not a member of channel(${name}).`,
      ]);
    }

    if (user.name !== memberName) {
      switch (membershipOfMember.role) {
        case MembershipRole.OWNER:
          // NOTE OWNER일 경우, 강퇴 불가
          throw new ForbiddenException(['You do not have permission.']);

        case MembershipRole.ADMIN:
          // NOTE ADMIN일 경우, OWNER만 강퇴 가능
          if (membershipOfRequester.role !== MembershipRole.OWNER) {
            throw new ForbiddenException(['You do not have permission.']);
          }
          break;

        case MembershipRole.MEMBER:
          // NOTE MEMBER일 경우, OWNER, ADMIN만 강퇴 가능
          if (membershipOfRequester.role === MembershipRole.MEMBER) {
            throw new ForbiddenException(['You do not have permission.']);
          }
          break;
      }
    }
    // NOTE 삭제
    const result = await this.membershipsRepository.delete({
      channel,
      user: member,
    });

    if (!result.affected) {
      throw new NotFoundException([
        `${memberName} is not a member of channel(${name}).`,
      ]);
    }

    // NOTE 권한 위임
    if (membershipOfMember.role === MembershipRole.OWNER) {
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
          const result = await this.channelsRepository.delete(channel.id);
          if (!result.affected) {
            throw new NotFoundException(['Cannot delete Channel']);
          }
        }
      }
    }
  }

  async updateChannelMemberRole(
    user: User,
    name: string,
    memberName: string,
    role: MembershipRole,
  ): Promise<Membership> {
    if (user.name === memberName) {
      throw new ForbiddenException(['Cannot change yourself.']);
    }

    if (role === MembershipRole.OWNER) {
      throw new ForbiddenException([
        `Cannot update ${memberName}'s role to ${role}.`,
      ]);
    }

    const channel: Channel = await this.getChannelByName(name);

    const membershipOfRequester: Membership =
      await this.membershipsRepository.findOne({ channel, user });
    if (!membershipOfRequester) {
      throw new NotFoundException([
        `${user.name} is not a member of channel(${name}).`,
      ]);
    }

    if (membershipOfRequester.role !== MembershipRole.OWNER) {
      throw new ForbiddenException(['You are not the owner.']);
    }
    const member: User = await this.usersService.getUserByName(memberName);

    const membershipOfMember: Membership =
      await this.membershipsRepository.findOne({
        channel,
        user: member,
      });
    if (!membershipOfMember) {
      throw new NotFoundException([
        `${member.name} is not a member of channel(${name}).`,
      ]);
    }

    await this.membershipsRepository.update(
      { channel, user: member },
      { channel, user: member, role },
    );

    return membershipOfMember;
  }

  async createChannelChat(
    name: string,
    user: User,
    content: string,
  ): Promise<Chat> {
    const channel: Channel = await this.getChannelByName(name);

    const isMember: Membership = await this.membershipsRepository.findOne({
      user,
      channel,
    });

    if (!isMember) {
      throw new ForbiddenException(['You are not a member of this channel.']);
    }

    const chat = this.chatsRepository.create({ channel, user, content });
    await this.chatsRepository.save(chat);
    // REVIEW socket.io 설정 추가
    this.eventsGateway.server.to(chat.channel.id).emit('message', chat);
    return chat;
  }

  async getChannelChats(
    user: User,
    name: string,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Chat[]> {
    const channel: Channel = await this.getChannelByName(name);

    const isMember: Membership = await this.membershipsRepository.findOne({
      user,
      channel,
    });

    if (!isMember) {
      throw new ForbiddenException(['You are not a member of this channel.']);
    }

    const options: any = {
      where: { channel },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    };

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
    console.log(data);

    return data;
  }

  async getChannelChatsCount(name: string, after?: Date): Promise<number> {
    const channel: Channel = await this.getChannelByName(name);
    const options: any = { channel };
    if (after) {
      options.createdAt = MoreThan(after);
    }
    return await this.chatsRepository.count(options);
  }
}
