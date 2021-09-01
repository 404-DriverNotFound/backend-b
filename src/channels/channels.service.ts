import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { ChannelsRepository } from './channels.repository';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(ChannelsRepository)
    private channelsRepository: ChannelsRepository,
  ) {}

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
}
