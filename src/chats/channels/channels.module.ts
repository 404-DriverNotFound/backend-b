import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsController } from './channels.controller';
import { ChannelsRepository } from './repositories/channels.repository';
import { ChannelsService } from './channels.service';
import { MembershipsRepository } from './repositories/memberships.repository';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChannelsRepository,
      MembershipsRepository,
      UsersRepository,
    ]),
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, UsersService],
})
export class ChannelsModule {}
