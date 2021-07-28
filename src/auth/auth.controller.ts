import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FtGuard } from './guards/ft.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get('42')
  @UseGuards(FtGuard)
  async ftAuth(): Promise<void> {
    return;
  }

  @Get('42/callback')
  @UseGuards(FtGuard)
  async ftAuthCallback(): Promise<void> {
    return;
  }

  @Get('42/status')
  async ftAuthStatus(@Req() req: Request) {
    return req.user;
  }
}
