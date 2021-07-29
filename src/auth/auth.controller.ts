import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FtGuard } from './guards/ft.guard';
import { Request } from 'express';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { RequirePermissions } from '../permissions/require-permissions.decorator';
import { Permission } from '../permissions/permission.enum';
import { ApiOAuth2, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @ApiOAuth2(['public'], '42')
  @Get('42')
  @UseGuards(FtGuard)
  async ftAuth(): Promise<void> {
    return;
  }

  @Get('42/callback')
  @UseGuards(FtGuard)
  async ftAuthCallback(): Promise<any> {
    return { message: 'Logged in!' };
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

  @Get('42/test')
  @RequirePermissions(Permission.ACCESS)
  @UseGuards(AuthenticatedGuard)
  create(@Req() req: Request) {
    return req.user;
  }
}
