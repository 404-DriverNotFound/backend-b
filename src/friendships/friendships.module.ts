import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsRepository } from './friendships.repository';
import { FriendshipsService } from './friendships.service';

@Module({
  imports: [TypeOrmModule.forFeature([FriendshipsRepository, UsersRepository])],
  controllers: [FriendshipsController],
  providers: [FriendshipsService, UsersService],
})
export class FriendshipsModule {}
