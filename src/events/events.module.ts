import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsRepository } from 'src/channels/repositories/channels.repository';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelsRepository, UsersRepository])],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
