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
import { Like, MoreThan } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { MembershipsRepository } from './repositories/memberships.repository';
import { UsersService } from 'src/users/users.service';
import { MembershipRole } from './membership-role.enum';
import { Chat } from './entities/chat.entity';
import { ChatsRepository } from './repositories/chats.repository';
import { EventsGateway } from 'src/events/events.gateway';
import { User } from 'src/users/entities/user.entity';

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
    user: User,
    name: string,
    password?: string,
  ): Promise<Channel> {
    const channel: Channel = await this.channelsRepository.findOne({
      name,
    });

    const membership: Membership = await this.membershipsRepository.findOne({
      channel,
      user,
    });

    if (!membership || membership.role === MembershipRole.BANNED) {
      throw new ForbiddenException(['You are not a member of this channel.']);
    }

    if (membership.role !== MembershipRole.OWNER) {
      throw new ForbiddenException(['Only the owner can change the password.']);
    }

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
  ): Promise<Membership> {
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

    let membership: Membership = await this.membershipsRepository.findOne({
      channel,
      user,
    });

    if (membership) {
      throw new ConflictException([
        `You are ${membership.role} in this channel.`,
      ]);
    }

    membership = this.membershipsRepository.create({
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
      await this.membershipsRepository.findOne({
        where: { channel, user },
      });
    if (!membershipOfRequester) {
      throw new NotFoundException([
        `${user.name} is not a member of channel(${name}).`,
      ]);
    }

    if (user.name !== memberName) {
      const member: User = await this.usersService.getUserByName(memberName);

      const membershipOfMember: Membership =
        await this.membershipsRepository.findOne({ channel, user: member });

      if (
        !(
          (membershipOfRequester.role === MembershipRole.OWNER ||
            membershipOfRequester.role === MembershipRole.ADMIN) &&
          membershipOfMember?.role === MembershipRole.BANNED
        )
      ) {
        throw new ForbiddenException(['You do not have permission.']);
      }

      // NOTE 삭제
      const result = await this.membershipsRepository.delete({
        channel,
        user: member,
      });
      if (!result.affected) {
        throw new NotFoundException([
          `${member.name} is not a banned user of this channel(${name}).`,
        ]);
      }
      return;
    }

    // NOTE 삭제
    const result = await this.membershipsRepository.delete({ channel, user });
    if (!result.affected) {
      throw new NotFoundException([
        `${user.name} is not a member of channel(${name}).`,
      ]);
    }

    // NOTE 권한 위임
    if (membershipOfRequester.role === MembershipRole.OWNER) {
      const membershipOfAdmin: Membership =
        await this.membershipsRepository.findOne({
          where: { channel, role: MembershipRole.ADMIN },
          relations: ['channel', 'user'],
        });

      if (membershipOfAdmin) {
        // NOTE 위임 to admin
        membershipOfAdmin.role = MembershipRole.OWNER;
        await this.membershipsRepository.save(membershipOfAdmin);
      } else {
        const membershipOfMember: Membership =
          await this.membershipsRepository.findOne({
            where: { channel, role: MembershipRole.MEMBER },
            relations: ['channel', 'user'],
          });

        if (membershipOfMember) {
          // NOTE 위임 to member
          membershipOfMember.role = MembershipRole.OWNER;
          await this.membershipsRepository.save(membershipOfMember);
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
        where: { channel, user: member },
        relations: ['channel'],
      });
    if (!membershipOfMember) {
      throw new NotFoundException([
        `${memberName} is not a member of channel(${name}).`,
      ]);
    }

    if (
      !(
        (membershipOfRequester.role === MembershipRole.OWNER &&
          membershipOfMember.role === MembershipRole.ADMIN &&
          (role === MembershipRole.MEMBER || role === MembershipRole.BANNED)) ||
        (membershipOfRequester.role === MembershipRole.OWNER &&
          membershipOfMember.role === MembershipRole.MEMBER &&
          (role === MembershipRole.ADMIN || role === MembershipRole.BANNED)) ||
        (membershipOfRequester.role === MembershipRole.OWNER &&
          membershipOfMember.role === MembershipRole.BANNED &&
          role === MembershipRole.MEMBER) ||
        (membershipOfRequester.role === MembershipRole.ADMIN &&
          membershipOfMember.role === MembershipRole.MEMBER &&
          role === MembershipRole.BANNED) ||
        (membershipOfRequester.role === MembershipRole.ADMIN &&
          membershipOfMember.role === MembershipRole.BANNED &&
          role === MembershipRole.MEMBER)
      )
    ) {
      throw new ForbiddenException([
        `You do not have permission(${user.name}(${membershipOfRequester.role}) cannot change ${member.name}(${membershipOfMember.role})'s role to ${role}).`,
      ]);
    }

    await this.membershipsRepository.update(
      { channel, user: member },
      { channel, user: member, role },
    );

    let event: string = null;
    if (role === MembershipRole.BANNED) {
      event = 'banned';
    } else if (membershipOfMember.role == MembershipRole.ADMIN) {
      event = 'adminToMember';
    }

    membershipOfMember.role = role;

    if (event) {
      this.eventsGateway.server.to(member.id).emit(event, membershipOfMember);
    }
    return membershipOfMember;
  }

  async updateChannelMemberMute(
    user: User,
    name: string,
    memberName: string,
  ): Promise<Membership> {
    if (user.name === memberName) {
      throw new ForbiddenException(['Cannot change yourself.']);
    }
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
      await this.membershipsRepository.findOne({ channel, user: member });
    if (!membershipOfMember) {
      throw new NotFoundException([
        `${memberName} is not a member of channel(${name}).`,
      ]);
    }

    if (
      !(
        (membershipOfRequester.role === MembershipRole.OWNER &&
          (membershipOfMember.role === MembershipRole.ADMIN ||
            membershipOfMember.role === MembershipRole.MEMBER)) ||
        (membershipOfRequester.role === MembershipRole.ADMIN &&
          membershipOfMember.role === MembershipRole.MEMBER)
      )
    ) {
      throw new ForbiddenException([
        `${user.name}(${membershipOfRequester.role}) cannot mute ${member.name}(${membershipOfMember.role}).`,
      ]);
    }

    const muteMinutes = 1;
    const unmutedAt: Date = new Date();
    unmutedAt.setMinutes(unmutedAt.getMinutes() + muteMinutes); // NOTE add muteMinutes

    membershipOfMember.unmutedAt = unmutedAt;

    await this.membershipsRepository.update(
      { channel, user: member },
      membershipOfMember,
    );

    setTimeout(async () => {
      membershipOfMember.unmutedAt = null;
      await this.membershipsRepository.update(
        { channel, user: member },
        membershipOfMember,
      );
    }, 60000 * muteMinutes);

    return membershipOfMember;
  }

  async updateChannelMemberUnmute(
    user: User,
    name: string,
    memberName: string,
  ): Promise<Membership> {
    if (user.name === memberName) {
      throw new ForbiddenException(['Cannot change yourself.']);
    }
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
      await this.membershipsRepository.findOne({ channel, user: member });
    if (!membershipOfMember) {
      throw new NotFoundException([
        `${memberName} is not a member of channel(${name}).`,
      ]);
    }

    if (
      !(
        (membershipOfRequester.role === MembershipRole.OWNER &&
          (membershipOfMember.role === MembershipRole.ADMIN ||
            membershipOfMember.role === MembershipRole.MEMBER)) ||
        (membershipOfRequester.role === MembershipRole.ADMIN &&
          membershipOfMember.role === MembershipRole.MEMBER)
      )
    ) {
      throw new ForbiddenException([
        `${user.name}(${membershipOfRequester.role}) cannot mute ${member.name}(${membershipOfMember.role}).`,
      ]);
    }

    membershipOfMember.unmutedAt = null;
    await this.membershipsRepository.update(
      { channel, user: member },
      membershipOfMember,
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

    if (isMember.unmutedAt) {
      const now: Date = new Date();

      const left = isMember.unmutedAt.valueOf() - now.valueOf();
      if (left > 0) {
        throw new ForbiddenException([
          `Mute ends ${Math.floor(left / 1000)} seconds later.`,
        ]);
      }
    }

    if (!isMember || isMember.role === MembershipRole.BANNED) {
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

    if (!isMember || isMember.role === MembershipRole.BANNED) {
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
