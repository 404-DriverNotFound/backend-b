import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/users/get-user.decorator';
import { User } from 'src/users/user.entity';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { FtGuard } from './guards/ft.guard';

@Controller('auth')
export class AuthController {
  @Get('42')
  @UseGuards(FtGuard)
  async ftAuth(): Promise<void> {
    return;
  }

  @Get('42/callback')
  @UseGuards(FtGuard)
  async ftAuthCallback(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Get('42/test')
  @UseGuards(AuthenticatedGuard)
  async test(@GetUser() user: User): Promise<User> {
    return user;
  }
}
