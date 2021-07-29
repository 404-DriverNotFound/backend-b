import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FtGuard } from './guards/ft.guard';
import { Request } from 'express';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { RequirePermissions } from '../permissions/require-permissions.decorator';
import { Permission } from '../permissions/permission.enum';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: '42 OAuth로 로그인합니다.' })
  @Get('42')
  @UseGuards(FtGuard)
  async ftAuth(): Promise<void> {
    return;
  }

  @ApiExcludeEndpoint()
  @Get('42/callback')
  @UseGuards(FtGuard)
  async ftAuthCallback(): Promise<any> {
    return { message: 'Logged in!' };
  }

  @ApiExcludeEndpoint()
  @Get('42/status')
  @UseGuards(AuthenticatedGuard)
  ftAuthStatus(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ summary: '로그아웃합니다.' })
  @Get('logout')
  @UseGuards(AuthenticatedGuard)
  logOut(@Req() req: Request) {
    req.logOut();
  }

  @ApiExcludeEndpoint()
  @Get('42/test')
  @RequirePermissions(Permission.ACCESS)
  @UseGuards(AuthenticatedGuard)
  create(@Req() req: Request) {
    return req.user;
  }
}
