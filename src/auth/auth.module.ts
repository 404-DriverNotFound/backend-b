import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './session.serializer';
import { FtStrategy } from './strategies/ft.strategy';
import { AuthService } from './auth.service';
//import { FriendshipsRepository } from 'src/friendships/friendships.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRepository /*, FriendshipsRepository*/]),
  ],
  controllers: [AuthController],
  providers: [
    ConfigService,
    FtStrategy,
    SessionSerializer,
    UsersService,
    AuthService,
  ],
})
export class AuthModule {}
