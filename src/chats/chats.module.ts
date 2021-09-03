import { Module } from '@nestjs/common';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [ChannelsModule],
})
export class ChatsModule {}
