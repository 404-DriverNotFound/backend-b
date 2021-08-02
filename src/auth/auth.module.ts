import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { AuthController } from './auth.controller';
import { FtStrategy } from './strategies/ft.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([UsersRepository])],
  controllers: [AuthController],
  providers: [ConfigService, FtStrategy],
})
export class AuthModule {}
