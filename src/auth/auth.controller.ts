import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FtGuard } from './guards/ft.guard';
import { Request } from 'express';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller('auth')
export class AuthController {
  @Get('42')
  @UseGuards(FtGuard)
  async ftAuth(): Promise<void> {
    return;
  }

  @Get('42/callback')
  @UseGuards(FtGuard)
  async ftAuthCallback(): Promise<any> {
    return { msg: 'Logged in!' };
  }

  @Get('42/status')
  @UseGuards(AuthenticatedGuard)
  ftAuthStatus(@Req() req: Request) {
    return req.user;
  }

  @Get('logout')
  @UseGuards(AuthenticatedGuard)
  logOut(@Req() req: Request) {
    req.logOut();
  }
}
