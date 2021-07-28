import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FtStrategy } from './strategies/ft.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FtStrategy, ConfigService],
})
export class AuthModule {}
