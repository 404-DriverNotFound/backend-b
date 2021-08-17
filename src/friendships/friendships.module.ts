import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsRepository } from './friendships.repository';
import { FriendshipsService } from './friendships.service';

@Module({
  imports: [TypeOrmModule.forFeature([FriendshipsRepository])],
  controllers: [FriendshipsController],
  providers: [FriendshipsService],
})
export class FriendshipsModule {}
