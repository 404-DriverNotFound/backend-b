import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { FriendshipsRepository } from './friendships.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FriendshipsRepository, UsersRepository])],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
