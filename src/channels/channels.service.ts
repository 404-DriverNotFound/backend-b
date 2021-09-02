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

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(ChannelsRepository)
    private readonly channelsRepository: ChannelsRepository,
    @InjectRepository(MembershipsRepository)
    private readonly membershipsRepository: MembershipsRepository,
    private readonly usersService: UsersService,
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

    const channel: Channel = this.channelsRepository.create({
      owner: user,
      name,
      password,
    });

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
      owner,
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

  async createChannelMembers(name: string, password: string, user: User) {
    const channel: Channel = await this.getChannelByName(name);

    const isCorrect: boolean = await bcrypt.compare(password, channel.password);

    if (!isCorrect) {
      throw new UnauthorizedException('Invalid password.');
    }

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
}
