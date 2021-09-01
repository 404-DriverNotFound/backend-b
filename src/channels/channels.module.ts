import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsController } from './channels.controller';
import { ChannelsRepository } from './channels.repository';
import { ChannelsService } from './channels.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelsRepository])],
  controllers: [ChannelsController],
  providers: [ChannelsService],
})
export class ChannelsModule {}
