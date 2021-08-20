import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipsRepository } from 'src/friendships/friendships.repository';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersRepository, FriendshipsRepository])],
  controllers: [UsersController],
  providers: [UsersService, ConfigService],
})
export class UsersModule {}
